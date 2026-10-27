use std::fs;
use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn restore_backup(app: AppHandle, path: String) -> Result<(), String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

    let db_path = app_dir.join("colismanager.db");
    let wal_path = app_dir.join("colismanager.db-wal");
    let shm_path = app_dir.join("colismanager.db-shm");

    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_file(&wal_path);
    let _ = fs::remove_file(&shm_path);

    fs::copy(path, &db_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn get_backups(app: AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

    let mut backups = Vec::new();

    let entries = fs::read_dir(&app_dir).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if let Some(name) = path.file_name() {
            let name = name.to_string_lossy().to_string();

            if name.ends_with(".db") && name != "colismanager.db" {
                backups.push(name);
            }
        }
    }

    backups.sort();
    backups.reverse();

    Ok(backups)
}

#[tauri::command]
pub fn rename_backup(app: AppHandle, old_name: String, new_name: String) -> Result<String, String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

    let clean_new = new_name.trim().trim_end_matches(".db").trim();
    if clean_new.is_empty() {
        return Err("Le nom de sauvegarde ne peut pas être vide".to_string());
    }

    if clean_new.contains('/') || clean_new.contains('\\') || clean_new.contains(':') || clean_new.contains('*') || clean_new.contains('?') || clean_new.contains('"') || clean_new.contains('<') || clean_new.contains('>') || clean_new.contains('|') || clean_new.contains("..") {
        return Err("Caractères invalides dans le nom de sauvegarde".to_string());
    }

    let final_new_name = format!("{}.db", clean_new);

    let old_db = app_dir.join(&old_name);
    let new_db = app_dir.join(&final_new_name);

    if !old_db.exists() {
        return Err(format!("Fichier {} introuvable", old_name));
    }

    if new_db.exists() && old_name != final_new_name {
        return Err("Une sauvegarde avec ce nom existe déjà".to_string());
    }

    fs::rename(&old_db, &new_db).map_err(|e| e.to_string())?;

    let old_wal = app_dir.join(old_name.replace(".db", ".db-wal"));
    let new_wal = app_dir.join(format!("{}.db-wal", clean_new));
    if old_wal.exists() {
        let _ = fs::rename(old_wal, new_wal);
    }

    let old_shm = app_dir.join(old_name.replace(".db", ".db-shm"));
    let new_shm = app_dir.join(format!("{}.db-shm", clean_new));
    if old_shm.exists() {
        let _ = fs::rename(old_shm, new_shm);
    }

    Ok(final_new_name)
}

#[tauri::command]
pub fn delete_backup(app: AppHandle, file_name: String) -> Result<(), String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

    let backup_path = app_dir.join(file_name);

    fs::remove_file(backup_path).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn restore_backup_file(app: AppHandle, file_name: String) -> Result<(), String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

    let db_path = app_dir.join("colismanager.db");
    let wal_path = app_dir.join("colismanager.db-wal");
    let shm_path = app_dir.join("colismanager.db-shm");

    let backup_db = app_dir.join(&file_name);

    let backup_wal = app_dir.join(file_name.replace(".db", ".db-wal"));

    let backup_shm = app_dir.join(file_name.replace(".db", ".db-shm"));

    // حذف الملفات الحالية بالكامل
    let _ = fs::remove_file(&db_path);
    let _ = fs::remove_file(&wal_path);
    let _ = fs::remove_file(&shm_path);

    // استرجاع قاعدة البيانات
    fs::copy(&backup_db, &db_path).map_err(|e| e.to_string())?;

    // استرجاع wal/shm إذا كانت موجودة
    let _ = fs::copy(&backup_wal, &wal_path);
    let _ = fs::copy(&backup_shm, &shm_path);

    println!("Backup restored successfully");

    Ok(())
}

#[tauri::command]
pub fn create_backup(app: AppHandle) -> Result<String, String> {
    let app_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

    let db_path = app_dir.join("colismanager.db");
    let wal_path = app_dir.join("colismanager.db-wal");
    let shm_path = app_dir.join("colismanager.db-shm");

    let backup_name = format!("backup_{}", chrono::Local::now().format("%Y%m%d_%H%M%S"));

    let backup_db = app_dir.join(format!("{}.db", backup_name));
    let backup_wal = app_dir.join(format!("{}.db-wal", backup_name));
    let backup_shm = app_dir.join(format!("{}.db-shm", backup_name));

    fs::copy(&db_path, &backup_db).map_err(|e| e.to_string())?;

    let _ = fs::copy(&wal_path, &backup_wal);
    let _ = fs::copy(&shm_path, &backup_shm);

    Ok(backup_db.display().to_string())
}



// #[tauri::command]
// pub fn restart_app(app: tauri::AppHandle) {
//     app.exit(0);
// }