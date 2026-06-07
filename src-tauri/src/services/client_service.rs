//src-tauri/src/services/client_service.rs
use sqlx::SqlitePool;
use crate::models::client::CreateClientRequest;

pub async fn create_client(
    pool: &SqlitePool,
    client: CreateClientRequest,
) -> Result<(), String> {

    sqlx::query(
        r#"
        INSERT INTO clients (
            full_name,
            phone_number,
            location_id,
            full_address
        )
        VALUES (?, ?, ?, ?)
        "#
    )
    .bind(client.full_name)
    .bind(client.phone_number)
    .bind(client.location_id)
    .bind(client.full_address)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}