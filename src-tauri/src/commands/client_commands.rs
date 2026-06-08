//commands/client_commands.rs

use crate::database::connection::AppState;
use crate::models::client::CreateClientRequest;
use crate::services::client_service;
use tauri::State;

#[tauri::command]
pub async fn create_client(
    state: State<'_, AppState>,
    payload: CreateClientRequest,
) -> Result<String, String> {
    log::info!("New client: {:?}", payload.full_name);
    println!("Name: {}", payload.full_name);
    println!("Phone: {}", payload.phone_number);
    log::info!("Phone: {}", payload.phone_number);


    client_service::create_client(&state.db, payload)
        .await
        .map(|_| "Client created".to_string())
}
