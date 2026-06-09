//src-tauri/src/models/client.rs
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
    #[sqlx(rename = "LocationID")]
    pub location_id: Option<i64>,
    #[sqlx(rename = "Address")]
    pub full_address: String,
   
}
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ClientResponse {
    #[sqlx(rename = "ClientID")]
    pub id: i64,

    #[sqlx(rename = "Name")]
    pub full_name: String,

    #[sqlx(rename = "Phone")]
    pub phone_number: String,

    #[sqlx(rename = "Address")]
    pub full_address: String,

    #[sqlx(rename = "Country")]
    pub country: Option<String>,

    #[sqlx(rename = "Region")]
    pub region: Option<String>,

    #[sqlx(rename = "City")]
    pub city: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ClientView {
    #[sqlx(rename = "ClientID")]
    pub id: i64,

    #[sqlx(rename = "Name")]
    pub full_name: String,

    #[sqlx(rename = "Phone")]
    pub phone_number: String,

    #[sqlx(rename = "Address")]
    pub full_address: String,

    #[sqlx(rename = "Country")]
    pub country: Option<String>,

    #[sqlx(rename = "Region")]
    pub region: Option<String>,

    #[sqlx(rename = "City")]
    pub city: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateClientRequest {
    pub full_name: String,
    pub phone_number: String,
    pub location_id: Option<i64>,
    pub full_address: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateClientRequest {
    pub id: i64,
    pub full_name: String,
    pub phone_number: String,
    pub location_id: Option<i64>,
    pub full_address: String,
}