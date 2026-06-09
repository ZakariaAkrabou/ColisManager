//commands/client_commands.rs

use crate::database::connection::AppState;
use crate::models::client::{Client, CreateClientRequest, UpdateClientRequest};
use crate::services::client_service;
use tauri::State;

#[tauri::command]
pub async fn create_client(
    state: State<'_, AppState>,
    payload: CreateClientRequest,
) -> Result<i64, String> {
    log::info!("New client: {:?}", payload.full_name);
    println!("Name: {}", payload.full_name);
    println!("Phone: {}", payload.phone_number);
    log::info!("Phone: {}", payload.phone_number);

    client_service::create_client(&state.db, payload).await
}

#[tauri::command]
pub async fn get_clients(
    state: State<'_, AppState>,
) -> Result<Vec<Client>, String> {
    client_service::get_clients(&state.db).await
}

#[tauri::command]
pub async fn update_client(
    state: State<'_, AppState>,
    payload: UpdateClientRequest,
) -> Result<String, String> {
    client_service::update_client(&state.db, payload)
        .await
        .map(|_| "Client updated".to_string())
}

#[tauri::command]
pub async fn delete_client(
    state: State<'_, AppState>,
    id: i64,
) -> Result<String, String> {
    client_service::delete_client(&state.db, id)
        .await
        .map(|_| "Client deleted".to_string())
}
