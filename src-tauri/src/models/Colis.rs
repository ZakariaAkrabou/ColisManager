use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Colis {
    #[sqlx(rename = "ColisID")]
    pub id: i64,
    #[sqlx(rename = "TrackingNumber")]
    pub tracking_number: String,
    #[sqlx(rename = "SenderName")]
    pub sender_name: String,
    #[sqlx(rename = "SenderPhone")]
    pub sender_phone: String,
    #[sqlx(rename = "SenderAddress")]
    pub sender_address: Option<String>,
    #[sqlx(rename = "SenderClientID")]
    pub sender_client_id: Option<i64>,
    #[sqlx(rename = "ReceiverName")]
    pub receiver_name: String,
    #[sqlx(rename = "ReceiverPhone")]
    pub receiver_phone: String,
    #[sqlx(rename = "ReceiverLocationID")]
    pub receiver_location_id: i64,
    #[sqlx(rename = "ReceiverCountry")]
    pub receiver_country: Option<String>,
    #[sqlx(rename = "ReceiverRegion")]
    pub receiver_region: Option<String>,
    #[sqlx(rename = "ReceiverCity")]
    pub receiver_city: Option<String>,
    #[sqlx(rename = "ReceiverFullAddress")]
    pub receiver_full_address: String,
    #[sqlx(rename = "ReceiverClientID")]
    pub receiver_client_id: Option<i64>,
    #[sqlx(rename = "Weight")]
    pub weight: f64,
    #[sqlx(rename = "Description")]
    pub description: Option<String>,
    #[sqlx(rename = "DeliveryType")]
    pub delivery_type: String,
    #[sqlx(rename = "TotalAmount")]
    pub total_amount: f64,
    #[sqlx(rename = "Status")]
    pub status: String,
    #[sqlx(rename = "Notes")]
    pub notes: Option<String>,
    #[sqlx(rename = "CreatedAt")]
    pub created_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PartyPayload {
    pub client_id: Option<i64>,
    pub name: String,
    pub phone: String,
    pub address: Option<String>,
    pub save_client: bool,
}

#[derive(Debug, Deserialize)]
pub struct ReceiverPayload {
    pub client_id: Option<i64>,
    pub name: String,
    pub phone: String,
    pub address: String,
    pub country: String,
    pub region: String,
    pub city: String,
    pub save_client: bool,
}

#[derive(Debug, Deserialize)]
pub struct CreateColisRequest {
    pub tracking_number: String,
    pub sender: PartyPayload,
    pub receiver: ReceiverPayload,
    pub weight: f64,
    pub description: Option<String>,
    pub delivery_type: String,
    pub total_amount: f64,
    pub notes: Option<String>,
    pub image_1: Option<Vec<u8>>,
    pub image_2: Option<Vec<u8>>,
    pub image_3: Option<Vec<u8>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateColisRequest {
    pub id: i64,
    pub sender_name: String,
    pub receiver_name: String,
    pub city: String,
    pub delivery_type: String,
    pub status: String,
    pub weight: f64,
    pub total_amount: f64,
    pub image_1: Option<Vec<u8>>,
    pub image_2: Option<Vec<u8>>,
    pub image_3: Option<Vec<u8>>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ColisImages {
    #[sqlx(rename = "Image1")]
    pub image_1: Option<Vec<u8>>,
    #[sqlx(rename = "Image2")]
    pub image_2: Option<Vec<u8>>,
    #[sqlx(rename = "Image3")]
    pub image_3: Option<Vec<u8>>,
}
