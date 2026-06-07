use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLocationPayload {
    pub country: String,
    pub region: String,
    pub city: Option<String>,
}
