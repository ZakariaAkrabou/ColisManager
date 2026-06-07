use sqlx::SqlitePool;
use std::path::PathBuf;
use std::env;

pub async fn create_pool() -> SqlitePool {
    let mut path: PathBuf = env::current_dir().unwrap();

    path.push("colis.db");

    let db_url = format!("sqlite://{}", path.display());

    println!("FINAL DB FILE: {}", path.display());
    println!("FINAL DB URL: {}", db_url);

    SqlitePool::connect(&db_url)
        .await
        .expect("Failed to connect to database")
}