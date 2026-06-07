use tauri::{command, State};
use crate::database::connection::AppState;
use crate::models::Location::{CreateLocationPayload, UpdateLocationPayload, LocationRow};
use crate::services::location_service;

#[command]
pub async fn get_locations(
    state: State<'_, AppState>,
) -> Result<Vec<LocationRow>, String> {
    location_service::get_locations(&state.db).await
}

#[command]
pub async fn create_location(
    payload: CreateLocationPayload,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    location_service::create_location(&state.db, payload).await
}

#[command]
pub async fn update_location(
    payload: UpdateLocationPayload,
    state: State<'_, AppState>,
) -> Result<(), String> {
    location_service::update_location(&state.db, payload).await
}

#[command]
pub async fn delete_location(
    id: i64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    location_service::delete_location(&state.db, id).await
}
