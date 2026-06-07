use sqlx::SqlitePool;
use crate::models::Location::CreateLocationPayload;

pub async fn create_location(
    pool: &SqlitePool,
    payload: CreateLocationPayload,
) -> Result<i64, String> {
    let city_name = match payload.city {
        Some(ref c) if !c.trim().is_empty() => c.clone(),
        _ => payload.region.clone(),
    };

    let location_id: i64 = sqlx::query_scalar(
        "INSERT INTO Locations (Country, City, Region) VALUES (?, ?, ?) ON CONFLICT(Country, City, Region) DO UPDATE SET Country=Country RETURNING LocationID"
    )
    .bind(&payload.country)
    .bind(&city_name)
    .bind(&payload.region)
    .fetch_one(pool)
    .await
    .map_err(|e| format!("Failed to insert location: {}", e))?;

    Ok(location_id)
}
