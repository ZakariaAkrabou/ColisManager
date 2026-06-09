use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Client {
    #[sqlx(rename = "ClientID")]
    pub id: i64,
    #[sqlx(rename = "Name")]
    pub full_name: String,
    #[sqlx(rename = "Phone")]
    pub phone_number: String,
    #[sqlx(rename = "ClientType")]
    pub client_type: Option<String>,
    pub country: Option<String>,
    pub region: Option<String>,
    pub city: Option<String>,
    #[sqlx(rename = "Address")]
    pub full_address: Option<String>,
    #[serde(rename = "totalSent")]
    pub total_sent: Option<f64>,
    #[serde(rename = "totalReceived")]
    pub total_received: Option<f64>,
    #[serde(rename = "totalAmount")]
    pub total_amount: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateClientRequest {
    pub client_type: String,
    pub full_name: String,
    pub phone_number: String,
    pub location_id: Option<i64>,
    pub full_address: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateClientRequest {
    pub id: i64,
    pub client_type: String,
    pub full_name: String,
    pub phone_number: String,
    pub location_id: Option<i64>,
    pub full_address: String,
}