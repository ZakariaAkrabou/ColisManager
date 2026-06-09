use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use tauri::{AppHandle, Manager};

pub struct AppState {
    pub db: SqlitePool,
}

pub async fn init_db(app_handle: &AppHandle) -> Result<AppState, String> {
    let app_dir = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?;
        
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let db_path = app_dir.join("colismanager.db");
    
    let connect_options = sqlx::sqlite::SqliteConnectOptions::new()
        .filename(&db_path)
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal);
    
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(connect_options)
        .await
        .map_err(|e| e.to_string())?;
        
   
    sqlx::query("PRAGMA journal_mode = WAL;")
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;

  
    use sqlx::Executor;
    let schema = include_str!("../../migrations/0001_schema.sql");
    pool.execute(schema)
        .await
        .map_err(|e| e.to_string())?;

    let client_type_exists: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM pragma_table_info('Clients') WHERE name='ClientType';")
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?;

    if client_type_exists == 0 {
        pool.execute("ALTER TABLE Clients ADD COLUMN ClientType TEXT NOT NULL DEFAULT 'destinataire';")
            .await
            .map_err(|e| e.to_string())?;
    }

    pool.execute("INSERT OR IGNORE INTO Locations (LocationID, Country, City, Region) VALUES (1, 'Morocco', 'Casablanca', 'Casablanca-Settat');")
        .await
        .map_err(|e| e.to_string())?;

    Ok(AppState { db: pool })
}
