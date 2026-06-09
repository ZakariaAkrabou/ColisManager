use sqlx::SqlitePool;
use crate::models::client::{Client, CreateClientRequest, UpdateClientRequest};

pub async fn create_client(
    pool: &SqlitePool,
    client: CreateClientRequest,
) -> Result<i64, String> {
    let location_id = if client.client_type == "destinataire" {
        client.location_id
    } else {
        None
    };

    let id = sqlx::query_scalar::<_, i64>(
        r#"
        INSERT INTO Clients (
            Name,
            Phone,
            ClientType,
            LocationID,
            Address
        )
        VALUES (?, ?, ?, ?, ?)
        RETURNING ClientID
        "#
    )
    .bind(client.full_name)
    .bind(client.phone_number)
    .bind(client.client_type)
    .bind(location_id)
    .bind(client.full_address)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(id)
}

pub async fn get_clients(pool: &SqlitePool) -> Result<Vec<Client>, String> {
    let clients = sqlx::query_as::<_, Client>(
        r#"
        SELECT
            c.ClientID AS ClientID,
            c.Name AS Name,
            c.Phone AS Phone,
            COALESCE(c.ClientType, 'destinataire') AS ClientType,
            COALESCE(l.Country, '') AS country,
            COALESCE(l.Region, '') AS region,
            l.City AS city,
            c.Address AS Address,
            0.0 AS total_sent,
            0.0 AS total_received,
            0.0 AS total_amount
        FROM Clients c
        LEFT JOIN Locations l ON c.LocationID = l.LocationID
        ORDER BY c.ClientID DESC
        "#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(clients)
}

pub async fn update_client(
    pool: &SqlitePool,
    client: UpdateClientRequest,
) -> Result<(), String> {
    let location_id = if client.client_type == "destinataire" {
        client.location_id
    } else {
        None
    };

    sqlx::query(
        r#"
        UPDATE Clients
        SET Name = ?, Phone = ?, ClientType = ?, LocationID = ?, Address = ?
        WHERE ClientID = ?
        "#
    )
    .bind(client.full_name)
    .bind(client.phone_number)
    .bind(client.client_type)
    .bind(location_id)
    .bind(client.full_address)
    .bind(client.id)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn delete_client(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM Clients WHERE ClientID = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
