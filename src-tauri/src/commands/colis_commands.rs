use crate::database::connection::AppState;
use crate::models::Colis::{Colis, CreateColisRequest};
use crate::services::colis_service;
use tauri::State;

#[tauri::command]
pub async fn create_colis(
    state: State<'_, AppState>,
    payload: CreateColisRequest,
) -> Result<Colis, String> {
    colis_service::create_colis(&state.db, payload).await
}

#[tauri::command]
pub async fn get_colis(state: State<'_, AppState>) -> Result<Vec<Colis>, String> {
    colis_service::get_colis(&state.db).await
}
