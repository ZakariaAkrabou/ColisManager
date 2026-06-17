use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Settings {
    pub company_name: String,
    pub owner_name: String,
    pub email: String,
    pub phone: String,
    pub phone2: Option<String>,
    pub address: String,
    pub website: Option<String>,
    pub logo_path: Option<String>,
}