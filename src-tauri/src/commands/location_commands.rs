use tauri::{command, State};
use crate::database::connection::AppState;
use crate::models::Location::CreateLocationPayload;
use crate::services::location_service;

#[command]
pub async fn create_location(
    payload: CreateLocationPayload,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    location_service::create_location(&state.db, payload).await
}
