pub mod commands;
mod database;
pub mod models;
pub mod services;


use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            tauri::async_runtime::block_on(async move {
                let state = database::connection::init_db(&handle)
                    .await
                    .expect("Failed to initialize database");

                handle.manage(state);
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:colismanager.db",
                    database::migration::get_migrations(),
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::location_commands::get_locations,
            commands::location_commands::create_location,
            commands::location_commands::update_location,
            commands::location_commands::delete_location,

            commands::client_commands::create_client,
            commands::client_commands::get_clients,
            commands::client_commands::update_client,
            commands::client_commands::delete_client,

            commands::colis_commands::create_colis,
            commands::colis_commands::get_colis,

            commands::settings_commandes::save_settings,
            commands::settings_commandes::get_settings,

            commands::shipping_settings_commands::get_shipping_settings,
            commands::shipping_settings_commands::save_shipping_settings,

            commands::backup_commands::create_backup,
            commands::backup_commands::restore_backup,
            commands::backup_commands::get_backups,
            commands::backup_commands::delete_backup,
            commands::backup_commands::restore_backup_file,
            // commands::backup_commands::restart_app,
            
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}