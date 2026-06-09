//commands/client_commands.rs

use tauri::{command, State};
use crate::database::connection::AppState;
use crate::models::client::{Client,ClientView, CreateClientRequest, UpdateClientRequest};
use crate::services::client_service;

#[command]
pub async fn create_client(
    payload: CreateClientRequest,
    state: State<'_, AppState>,
) -> Result<String, String> {
    log::info!("New client: {}", payload.full_name);
    client_service::create_client(&state.db, payload)
        .await
        .map(|_| "Client created".to_string())
}

#[command]
pub async fn get_clients(
    state: State<'_, AppState>,
) -> Result<Vec<ClientView>, String> {
    client_service::get_all_clients(&state.db).await
}

#[command]
pub async fn get_client(
    id: i64,
    state: State<'_, AppState>,
) -> Result<Client, String> {
    client_service::get_client(&state.db, id).await
}

#[command]
pub async fn update_client(
    payload: UpdateClientRequest,
    state: State<'_, AppState>,
) -> Result<(), String> {
    client_service::update_client(&state.db, payload).await
}

#[command]
pub async fn delete_client(
    id: i64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    client_service::delete_client(&state.db, id).await
}
