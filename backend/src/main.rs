use axum::{
    body::Body,
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    http::{header, Response, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};
use include_dir::{include_dir, Dir};
use serde::Deserialize;
use std::net::SocketAddr;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use tokio::time::{timeout, Duration};

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
    println!("[INFO] - WebSocket connected.");

    loop {
        let msg = match timeout(Duration::from_secs(60), socket.recv()).await {
            Ok(Some(Ok(m))) => m,
            Ok(None) => {
                println!("[WARN] - WebSocket closed by client. Shutting down...");
                break;
            }
            Ok(Some(Err(e))) => {
                println!("[ERR] - WebSocket error: {}. Shutting down...", e);
                break;
            }
            Err(_) => {
                println!("[WARN] - Connection timed out. Shutting down...");
                break;
            }
        };

        if let Message::Text(text) = msg {
            let req: SimRequest = match serde_json::from_str(&text) {
                Ok(r) => r,
                Err(_) => {
                    continue;
                }
            };

            println!("[INFO] - Starting simulation: {} {}", req.protocol, req.args);

            let mut cmd = Command::new("stdbuf");
            cmd.arg("-oL");
            cmd.arg("proto-sim");
            cmd.arg(&req.protocol);
            for arg in req.args.split_whitespace() {
                cmd.arg(arg);
            }
            cmd.stdout(Stdio::piped());
            
            let mut child = match cmd.spawn() {
                Ok(c) => c,
                Err(e) => {
                    let _ = socket.send(Message::Text(format!("Failed to spawn tool: {}", e))).await;
                    continue;
                }
            };

            let stdout = child.stdout.take().expect("Failed to capture stdout");
            let mut reader = BufReader::new(stdout).lines();

            loop {
                tokio::select! {
                    line_res = reader.next_line() => {
                        match line_res {
                            Ok(Some(line)) => {
                                if socket.send(Message::Text(line)).await.is_err() {
                                    println!("[WARN] - Client disconnected during stream.");
                                    let _ = child.kill().await;
                                    std::process::exit(0); 
                                }
                            }
                            Ok(None) => break,
                            Err(e) => {
                                let _ = socket.send(Message::Text(format!("Stream error: {}", e))).await;
                                break;
                            }
                        }
                    }
                    _ = socket.recv() => {

                    }
                }
            }
            let _ = socket.send(Message::Text("\n[Process Finished]".to_string())).await;
        }
    }

    std::process::exit(0);
}