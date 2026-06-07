//src-tauri/src/models/client.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Client {
    pub id: i64,
    pub full_name: String,
    pub phone_number: String,
    pub country: String,
    pub region: String,
    pub city: String,
    pub full_address: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateClientRequest {
    pub full_name: String,
    pub phone_number: String,
    pub country: String,
    pub region: String,
    pub city: String,
    pub full_address: String,
}