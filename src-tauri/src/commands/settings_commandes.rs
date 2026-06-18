use crate::database::connection::AppState;

use crate::models::Settings::Settings;
use tauri::State;

#[tauri::command]
pub async fn save_settings(
    state: State<'_, AppState>,
    settings: Settings,
) -> Result<(), String> {
    sqlx::query(
        r#"
        UPDATE Settings SET
            CompanyName = ?,
            OwnerName = ?,
            Email = ?,
            Phone = ?,
            Phone2 = ?,
            Address = ?,
            Website = ?,
            LogoPath = ?,
            UpdatedAt = CURRENT_TIMESTAMP
        WHERE id = 1
        "#,
    )
    .bind(&settings.company_name)
    .bind(&settings.owner_name)
    .bind(&settings.email)
    .bind(&settings.phone)
    .bind(&settings.phone2)
    .bind(&settings.address)
    .bind(&settings.website)
    .bind(&settings.logo_path)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub async fn get_settings(
    state: State<'_, AppState>,
) -> Result<Settings, String> {
    let row = sqlx::query_as::<_, Settings>(
        r#"
        SELECT
            CompanyName as company_name,
            OwnerName as owner_name,
            Email as email,
            Phone as phone,
            Phone2 as phone2,
            Address as address,
            Website as website,
            LogoPath as logo_path
        FROM Settings
        WHERE id = 1
        "#
    )
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(row)
}