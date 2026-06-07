use sqlx::SqlitePool;
use crate::models::Location::{CreateLocationPayload, UpdateLocationPayload, LocationRow};

pub async fn get_locations(pool: &SqlitePool) -> Result<Vec<LocationRow>, String> {
    let locations = sqlx::query_as::<_, LocationRow>(
        "SELECT LocationID, Country, City, Region FROM Locations ORDER BY LocationID ASC"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to fetch locations: {}", e))?;

    Ok(locations)
}

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

pub async fn update_location(
    pool: &SqlitePool,
    payload: UpdateLocationPayload,
) -> Result<(), String> {
    let city_name = match payload.city {
        Some(ref c) if !c.trim().is_empty() => c.clone(),
        _ => payload.region.clone(),
    };

    let rows_affected = sqlx::query(
        "UPDATE Locations SET Country = ?, City = ?, Region = ? WHERE LocationID = ?"
    )
    .bind(&payload.country)
    .bind(&city_name)
    .bind(&payload.region)
    .bind(payload.id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to update location: {}", e))?
    .rows_affected();

    if rows_affected == 0 {
        return Err(format!("Location with ID {} not found", payload.id));
    }

    Ok(())
}

pub async fn delete_location(pool: &SqlitePool, id: i64) -> Result<(), String> {
    let rows_affected = sqlx::query("DELETE FROM Locations WHERE LocationID = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete location: {}", e))?
        .rows_affected();

    if rows_affected == 0 {
        return Err(format!("Location with ID {} not found", id));
    }

    Ok(())
}
