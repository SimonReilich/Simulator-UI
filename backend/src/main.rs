use axum::{
    Router,
    body::Body,
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    http::{Response, StatusCode, header},
    response::IntoResponse,
    routing::get,
};
use include_dir::{Dir, include_dir};
use serde::Deserialize;
use std::net::SocketAddr;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;
use tokio::time::{Duration, timeout};

static FRONTEND_DIR: Dir<'_> = include_dir!("$FRONTEND_DIST");

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .fallback(static_handler);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4444));
    println!("\n[INFO] - Server started at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn static_handler(uri: axum::http::Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/');
    let target_path = if path.is_empty() { "index.html" } else { path };

    if let Some(file) = FRONTEND_DIR.get_file(target_path) {
        return serve_file(target_path, file.contents());
    }
    if let Some(index) = FRONTEND_DIR.get_file("index.html") {
        return serve_file("index.html", index.contents());
    }

    (StatusCode::NOT_FOUND, "Frontend not found in binary").into_response()
}

fn serve_file(path: &str, contents: &'static [u8]) -> Response<Body> {
    let mime = mime_guess::from_path(path).first_or_octet_stream();
    Response::builder()
        .header(header::CONTENT_TYPE, mime.as_ref())
        .body(Body::from(contents))
        .unwrap()
}

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket))
}

#[derive(Deserialize, Debug)]
struct SimRequest {
    protocol: String,
    args: String,
}

async fn handle_socket(mut socket: WebSocket) {
    let mut is_heartbeat = true;

    loop {
        let msg = match timeout(Duration::from_secs(60), socket.recv()).await {
            Ok(Some(Ok(m))) => m,
            Ok(None) => {
                if is_heartbeat {
                    println!("[WARN] - WebSocket closed by client. Shutting down...");
                    break;
                }
                break;
            }
            Ok(Some(Err(e))) => {
                if is_heartbeat {
                    println!("[ERR] - WebSocket error: {}. Shutting down...", e);
                    break;
                }
                break;
            }
            Err(_) => {
                if is_heartbeat {
                    println!("[WARN] - Connection timed out. Shutting down...");
                    break;
                }
                break;
            }
        };

        if let Message::Text(text) = msg {
            if !text.contains("ping") {
                is_heartbeat = false;
            }
            let req: SimRequest = match serde_json::from_str(&text) {
                Ok(r) => r,
                Err(_) => {
                    continue;
                }
            };

            println!(
                "[INFO] - Starting simulation: {} {}",
                req.protocol, req.args
            );

            let mut cmd = Command::new("stdbuf");
            cmd.arg("-oL");
            cmd.arg("proto-sim");
            cmd.arg(&req.protocol);
            for arg in req.args.split_whitespace() {
                cmd.arg(arg);
            }
            cmd.stdin(Stdio::piped());
            cmd.stdout(Stdio::piped());

            let mut child = cmd.spawn().expect("Failed to spawn");
            let stdout = child.stdout.take().expect("Failed to capture stdout");
            let mut stdin = child.stdin.take().expect("Failed to capture stdin"); // Get stdin handle
            let mut reader = BufReader::new(stdout).lines();

            loop {
                tokio::select! {
                    // Output from the CLI tool to the Browser
                    line_res = reader.next_line() => {
                        match line_res {
                            Ok(Some(line)) => {
                                if socket.send(Message::Text(line)).await.is_err() {
                                    let _ = child.kill().await;
                                    return;
                                }
                            }
                            Ok(None) => break,
                            Err(_) => break,
                        }
                    }
                    // Input from the Browser to the CLI tool
                    msg_res = socket.recv() => {
                        match msg_res {
                            Some(Ok(Message::Text(input))) => {
                                // Forward the text from the frontend directly to the tool's stdin
                                if let Err(e) = stdin.write_all(format!("{}\n", input).as_bytes()).await {
                                    println!("[ERR] Failed to write to stdin: {}", e);
                                }
                            }
                            _ => {
                                println!("[INFO] Client disconnected. Killing simulation...");
                                let _ = child.kill().await;
                                return;
                            }
                        }
                    }
                }
            }
            let _ = socket
                .send(Message::Text("\n[Process Finished]".to_string()))
                .await;
        }
    }

    if is_heartbeat {
        std::process::exit(0);
    } else {
        println!("[INFO] - Simulation finished, closing connection")
    }
}
