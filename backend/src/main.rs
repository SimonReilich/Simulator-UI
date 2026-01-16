use axum::{
    Router,
    body::Body,
    http::{Response, StatusCode, header},
    response::IntoResponse,
    extract::ws::{WebSocket, WebSocketUpgrade},
    routing::{get, post},
};
use include_dir::{Dir, include_dir};
use std::net::SocketAddr;

static FRONTEND_DIR: Dir<'_> = include_dir!("$FRONTEND_DIST");

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/run", post(run_simulation)) 
        .route("/ws", get(ws_handler)) 
        .fallback(static_handler);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4444));
    println!("[INFO] - Server started at http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn run_simulation() -> &'static str {
    "Simulation results would go here!"
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

use tokio::time::{timeout, Duration};

async fn handle_socket(mut socket: WebSocket) {
    println!("[INFO] - Heartbeat established. Server will stay alive while tab is open.");

    loop {
        match timeout(Duration::from_secs(15), socket.recv()).await {
            Ok(Some(Ok(_msg))) => {
                // Do Nothing
            }
            Ok(None) => {
                println!("[WARN] - WebSocket stream ended. Shutting down...");
                break;
            }
            Ok(Some(Err(e))) => {
                println!("[ERRS] - WebSocket error: {}. Shutting down...", e);
                break;
            }
            Err(_) => {
                println!("[WARN] - Heartbeat timed out (no ping for 5s). Shutting down...");
                break;
            }
        }
    }

    std::process::exit(0);
}