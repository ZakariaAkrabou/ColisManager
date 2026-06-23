use crate::models::Colis::{Colis, ColisImages, CreateColisRequest, PartyPayload, ReceiverPayload, UpdateColisRequest};
use crate::models::shipping_settings::ShippingSettings;
use sqlx::{Sqlite, SqlitePool, Transaction};

pub async fn create_colis(pool: &SqlitePool, payload: CreateColisRequest) -> Result<Colis, String> {
    validate_colis_payload(&payload)?;

    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    let receiver_location_id = get_or_create_location(
        &mut tx,
        &payload.receiver.country,
        &payload.receiver.region,
        &payload.receiver.city,
    )
    .await?;

    let sender_client_id = get_or_create_party_client(
        &mut tx,
        "expediteur",
        &payload.sender,
        None,
    )
    .await?;

    let receiver_client_id = get_or_create_receiver_client(
        &mut tx,
        &payload.receiver,
        receiver_location_id,
    )
    .await?;

    let delivery_type = normalize_delivery_type(&payload.delivery_type)?;

    let settings = sqlx::query_as::<_, ShippingSettings>(
        r#"
        SELECT
            AgencyDeliveryFee as agency_delivery_fee,
            HomeDeliveryFee as home_delivery_fee
        FROM ShippingSettings
        WHERE id = 1
        "#
    )
    .fetch_one(&mut *tx)
    .await
    .unwrap_or(ShippingSettings {
        agency_delivery_fee: 20.0,
        home_delivery_fee: 30.0,
    });

    let calculated_amount = if payload.weight <= 10.0 {
        if delivery_type == "agency" { 100.0 } else { 200.0 }
    } else {
        if delivery_type == "agency" { payload.weight * settings.agency_delivery_fee } else { payload.weight * settings.home_delivery_fee }
    };

    let colis_id = sqlx::query_scalar::<_, i64>(
        r#"
        INSERT INTO Colis (
            TrackingNumber,
            SenderName,
            SenderPhone,
            SenderAddress,
            SenderClientID,
            ReceiverName,
            ReceiverPhone,
            ReceiverLocationID,
            ReceiverFullAddress,
            ReceiverClientID,
            Weight,
            Description,
            DeliveryType,
            TotalAmount,
            Notes,
            Image1,
            Image2,
            Image3
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING ColisID
        "#,
    )
    .bind(payload.tracking_number.trim())
    .bind(payload.sender.name.trim())
    .bind(payload.sender.phone.trim())
    .bind(optional_trim(payload.sender.address.as_deref()))
    .bind(sender_client_id)
    .bind(payload.receiver.name.trim())
    .bind(payload.receiver.phone.trim())
    .bind(receiver_location_id)
    .bind(payload.receiver.address.trim())
    .bind(receiver_client_id)
    .bind(payload.weight)
    .bind(optional_trim(payload.description.as_deref()))
    .bind(delivery_type)
    .bind(calculated_amount)
    .bind(optional_trim(payload.notes.as_deref()))
    .bind(payload.image_1.as_deref())
    .bind(payload.image_2.as_deref())
    .bind(payload.image_3.as_deref())
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    get_colis_by_id(pool, colis_id).await
}

pub async fn update_colis(pool: &SqlitePool, payload: UpdateColisRequest) -> Result<Colis, String> {
    let mut tx = pool.begin().await.map_err(|e| e.to_string())?;

    #[derive(sqlx::FromRow)]
    struct LocationInfo {
        #[sqlx(rename = "Country")]
        country: String,
        #[sqlx(rename = "Region")]
        region: String,
    }

    let loc_info = sqlx::query_as::<_, LocationInfo>(
        r#"
        SELECT l.Country, l.Region
        FROM Colis c
        JOIN Locations l ON c.ReceiverLocationID = l.LocationID
        WHERE c.ColisID = ?
        "#
    )
    .bind(payload.id)
    .fetch_one(&mut *tx)
    .await
    .unwrap_or(LocationInfo {
        country: "Morocco".to_string(),
        region: "Default Region".to_string(),
    });

    let receiver_location_id = get_or_create_location(
        &mut tx,
        &loc_info.country,
        &loc_info.region,
        &payload.city,
    )
    .await?;

    let delivery_type = normalize_delivery_type(&payload.delivery_type)?;
    let status = normalize_status(&payload.status)?;

    sqlx::query(
        r#"
        UPDATE Colis
        SET
            SenderName = ?,
            ReceiverName = ?,
            ReceiverLocationID = ?,
            DeliveryType = ?,
            Weight = ?,
            Status = ?,
            TotalAmount = ?,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE ColisID = ?
        "#
    )
    .bind(payload.sender_name.trim())
    .bind(payload.receiver_name.trim())
    .bind(receiver_location_id)
    .bind(delivery_type)
    .bind(payload.weight)
    .bind(status)
    .bind(payload.total_amount)
    .bind(payload.id)
    .execute(&mut *tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;

    get_colis_by_id(pool, payload.id).await
}

pub async fn delete_colis(pool: &SqlitePool, id: i64) -> Result<(), String> {
    sqlx::query("DELETE FROM Colis WHERE ColisID = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn get_colis_images(pool: &SqlitePool, id: i64) -> Result<ColisImages, String> {
    sqlx::query_as::<_, ColisImages>(
        "SELECT Image1, Image2, Image3 FROM Colis WHERE ColisID = ?"
    )
    .bind(id)
    .fetch_one(pool)
    .await
    .map_err(|e| e.to_string())
}

pub async fn get_colis(pool: &SqlitePool) -> Result<Vec<Colis>, String> {
    sqlx::query_as::<_, Colis>(COLIS_SELECT_SQL)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())
}

async fn get_colis_by_id(pool: &SqlitePool, id: i64) -> Result<Colis, String> {
    sqlx::query_as::<_, Colis>(&format!("{} WHERE c.ColisID = ?", COLIS_SELECT_BASE_SQL))
        .bind(id)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())
}

async fn get_or_create_location(
    tx: &mut Transaction<'_, Sqlite>,
    country: &str,
    region: &str,
    city: &str,
) -> Result<i64, String> {
    let city_name = if city.trim().is_empty() {
        region.trim()
    } else {
        city.trim()
    };

    sqlx::query_scalar::<_, i64>(
        r#"
        INSERT INTO Locations (Country, City, Region)
        VALUES (?, ?, ?)
        ON CONFLICT(Country, City, Region) DO UPDATE SET Country = Country
        RETURNING LocationID
        "#,
    )
    .bind(country.trim())
    .bind(city_name)
    .bind(region.trim())
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

async fn get_or_create_party_client(
    tx: &mut Transaction<'_, Sqlite>,
    client_type: &str,
    party: &PartyPayload,
    location_id: Option<i64>,
) -> Result<Option<i64>, String> {
    if let Some(client_id) = party.client_id {
        return Ok(Some(client_id));
    }

    if !party.save_client {
        return Ok(None);
    }

    create_client_for_colis(
        tx,
        client_type,
        party.name.trim(),
        party.phone.trim(),
        optional_trim(party.address.as_deref()).as_deref(),
        location_id,
    )
    .await
    .map(Some)
}

async fn get_or_create_receiver_client(
    tx: &mut Transaction<'_, Sqlite>,
    receiver: &ReceiverPayload,
    location_id: i64,
) -> Result<Option<i64>, String> {
    if let Some(client_id) = receiver.client_id {
        return Ok(Some(client_id));
    }

    if !receiver.save_client {
        return Ok(None);
    }

    create_client_for_colis(
        tx,
        "destinataire",
        receiver.name.trim(),
        receiver.phone.trim(),
        Some(receiver.address.trim()),
        Some(location_id),
    )
    .await
    .map(Some)
}

async fn create_client_for_colis(
    tx: &mut Transaction<'_, Sqlite>,
    client_type: &str,
    name: &str,
    phone: &str,
    address: Option<&str>,
    location_id: Option<i64>,
) -> Result<i64, String> {
    sqlx::query_scalar::<_, i64>(
        r#"
        INSERT INTO Clients (Name, Phone, ClientType, LocationID, Address)
        VALUES (?, ?, ?, ?, ?)
        RETURNING ClientID
        "#,
    )
    .bind(name)
    .bind(phone)
    .bind(client_type)
    .bind(location_id)
    .bind(address)
    .fetch_one(&mut **tx)
    .await
    .map_err(|e| e.to_string())
}

fn validate_colis_payload(payload: &CreateColisRequest) -> Result<(), String> {
    if payload.tracking_number.trim().is_empty() {
        return Err("Tracking number is required".to_string());
    }
    if payload.sender.name.trim().is_empty() {
        return Err("Sender name is required".to_string());
    }
    if payload.receiver.name.trim().is_empty() {
        return Err("Receiver name is required".to_string());
    }
    if payload.receiver.address.trim().is_empty() {
        return Err("Receiver address is required".to_string());
    }
    if payload.receiver.country.trim().is_empty()
        || payload.receiver.region.trim().is_empty()
        || payload.receiver.city.trim().is_empty()
    {
        return Err("Receiver location is required".to_string());
    }
    if payload.weight <= 0.0 {
        return Err("Weight must be greater than zero".to_string());
    }

    Ok(())
}

fn normalize_delivery_type(delivery_type: &str) -> Result<&'static str, String> {
    match delivery_type.trim().to_lowercase().as_str() {
        "agency" | "agence" | "standard" => Ok("agency"),
        "home" | "domicile" => Ok("home"),
        _ => Err("Invalid delivery type".to_string()),
    }
}

fn normalize_status(status: &str) -> Result<&'static str, String> {
    match status.trim().to_lowercase().as_str() {
        "en attente" | "pending" => Ok("pending"),
        "en transit" | "transit" => Ok("transit"),
        "livré" | "livre" | "delivered" => Ok("delivered"),
        "annulé" | "annule" | "cancelled" => Ok("cancelled"),
        _ => Err("Invalid status".to_string()),
    }
}

fn optional_trim(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

const COLIS_SELECT_BASE_SQL: &str = r#"
    SELECT
        c.ColisID AS ColisID,
        c.TrackingNumber AS TrackingNumber,
        c.SenderName AS SenderName,
        c.SenderPhone AS SenderPhone,
        c.SenderAddress AS SenderAddress,
        c.SenderClientID AS SenderClientID,
        c.ReceiverName AS ReceiverName,
        c.ReceiverPhone AS ReceiverPhone,
        c.ReceiverLocationID AS ReceiverLocationID,
        l.Country AS ReceiverCountry,
        l.Region AS ReceiverRegion,
        l.City AS ReceiverCity,
        c.ReceiverFullAddress AS ReceiverFullAddress,
        c.ReceiverClientID AS ReceiverClientID,
        c.Weight AS Weight,
        c.Description AS Description,
        c.DeliveryType AS DeliveryType,
        c.TotalAmount AS TotalAmount,
        c.Status AS Status,
        c.Notes AS Notes,
        c.CreatedAt AS CreatedAt
    FROM Colis c
    LEFT JOIN Locations l ON c.ReceiverLocationID = l.LocationID
"#;

const COLIS_SELECT_SQL: &str = r#"
    SELECT
        c.ColisID AS ColisID,
        c.TrackingNumber AS TrackingNumber,
        c.SenderName AS SenderName,
        c.SenderPhone AS SenderPhone,
        c.SenderAddress AS SenderAddress,
        c.SenderClientID AS SenderClientID,
        c.ReceiverName AS ReceiverName,
        c.ReceiverPhone AS ReceiverPhone,
        c.ReceiverLocationID AS ReceiverLocationID,
        l.Country AS ReceiverCountry,
        l.Region AS ReceiverRegion,
        l.City AS ReceiverCity,
        c.ReceiverFullAddress AS ReceiverFullAddress,
        c.ReceiverClientID AS ReceiverClientID,
        c.Weight AS Weight,
        c.Description AS Description,
        c.DeliveryType AS DeliveryType,
        c.TotalAmount AS TotalAmount,
        c.Status AS Status,
        c.Notes AS Notes,
        c.CreatedAt AS CreatedAt
    FROM Colis c
    LEFT JOIN Locations l ON c.ReceiverLocationID = l.LocationID
    ORDER BY c.ColisID DESC
"#;
