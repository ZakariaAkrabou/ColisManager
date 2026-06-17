// path src-tauri/src/models/shipping_settings.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ShippingSettings {
    pub agency_delivery_fee: f64,
    pub home_delivery_fee: f64,
}