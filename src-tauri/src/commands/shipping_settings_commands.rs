use crate::database::connection::AppState;
use crate::models::shipping_settings::ShippingSettings;
use tauri::State;

#[tauri::command]
pub async fn get_shipping_settings(
    state: State<'_, AppState>,
) -> Result<ShippingSettings, String> {
    let settings = sqlx::query_as::<_, ShippingSettings>(
        r#"
        SELECT
            AgencyDeliveryFee as agency_delivery_fee,
            HomeDeliveryFee as home_delivery_fee
        FROM ShippingSettings
        WHERE id = 1
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(settings)
}

#[tauri::command]
pub async fn save_shipping_settings(
    state: State<'_, AppState>,
    settings: ShippingSettings,
) -> Result<(), String> {
    sqlx::query(
        r#"
        UPDATE ShippingSettings
        SET
            AgencyDeliveryFee = ?,
            HomeDeliveryFee = ?,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE id = 1
        "#
    )
    .bind(settings.agency_delivery_fee)
    .bind(settings.home_delivery_fee)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
} 
