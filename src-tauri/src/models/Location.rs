use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct LocationRow {
    #[sqlx(rename = "LocationID")]
    pub id: i64,
    #[sqlx(rename = "Country")]
    pub country: String,
    #[sqlx(rename = "Region")]
    pub region: String,
    #[sqlx(rename = "City")]
    pub city: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLocationPayload {
    pub country: String,
    pub region: String,
    pub city: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateLocationPayload {
    pub id: i64,
    pub country: String,
    pub region: String,
    pub city: Option<String>,
}
