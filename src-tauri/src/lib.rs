//lib.rs
mod database;
mod commands;
mod models;
mod services;

use crate::database::connection;
use crate::database::state::AppState;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn run() {
    let db = connection::create_pool().await;
    let app_state = AppState { db };

    tauri::Builder::default()
        .manage(app_state)

        .plugin(tauri_plugin_opener::init())

        .plugin(tauri_plugin_sql::Builder::default().build())

        .invoke_handler(
            tauri::generate_handler![
                greet,
                commands::client_commands::create_client
            ]
        )

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}