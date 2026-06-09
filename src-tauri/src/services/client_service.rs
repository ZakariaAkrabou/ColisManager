//src-tauri/src/services/client_service.rs
use sqlx::SqlitePool;
use crate::models::client::{Client,ClientView, CreateClientRequest, UpdateClientRequest};

pub async fn create_client(
    pool: &SqlitePool,
    client: CreateClientRequest,
) -> Result<(), String> {

    sqlx::query(
        r#"
        INSERT INTO Clients (
            Name,
            Phone,
            LocationID,
            Address
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

pub async fn get_all_clients(
    pool: &SqlitePool,
) -> Result<Vec<ClientView>, String> {

    let clients = sqlx::query_as::<_, ClientView>(
        r#"
        SELECT
            c.ClientID,
            c.Name,
            c.Phone,
            c.Address,
            l.Country,
            l.Region,
            l.City
        FROM Clients c
        LEFT JOIN Locations l
            ON c.LocationID = l.LocationID
        ORDER BY c.ClientID DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(clients)
}


pub async fn get_client(pool: &SqlitePool, id: i64) -> Result<Client, String> {
    let client = sqlx::query_as::<_, Client>(
        r#"
        SELECT
            ClientID,
            Name,
            Phone,
            LocationID,
            Address
        FROM Clients
        WHERE ClientID = ?
        "#,
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to fetch client {}: {}", id, e))?;

    Ok(client)
}

pub async fn update_client(
    pool: &SqlitePool,
    client: UpdateClientRequest,
) -> Result<(), String> {
    let rows_affected = sqlx::query(
        r#"
        UPDATE Clients
        SET Name = ?, Phone = ?, LocationID = ?, Address = ?
        WHERE ClientID = ?
        "#,
    )
    .bind(client.full_name)
    .bind(client.phone_number)
    .bind(client.location_id)
    .bind(client.full_address)
    .bind(client.id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update client: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err(format!("Client with ID {} not found", client.id));
    }

    Ok(())
}

pub async fn delete_client(pool: &SqlitePool, id: i64) -> Result<(), String> {
    let rows_affected = sqlx::query(
        "DELETE FROM Clients WHERE ClientID = ?"
    )
    .bind(id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to delete client: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err(format!("Client with ID {} not found", id));
    }

    Ok(())
}