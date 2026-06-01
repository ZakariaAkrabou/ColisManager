use tauri_plugin_sql::{Migration, MigrationKind};


pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: r#"
                -- 1. COUNTRIES TABLE
                CREATE TABLE IF NOT EXISTS Countries (
                    CountryID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL UNIQUE
                );

                -- 2. CITIES TABLE
                CREATE TABLE IF NOT EXISTS Cities (
                    CityID INTEGER PRIMARY KEY AUTOINCREMENT,
                    CountryID INTEGER,
                    Name TEXT NOT NULL,
                    FOREIGN KEY (CountryID) REFERENCES Countries(CountryID) ON DELETE RESTRICT
                );

                -- 3. REGIONS TABLE
                CREATE TABLE IF NOT EXISTS Regions (
                    RegionID INTEGER PRIMARY KEY AUTOINCREMENT,
                    CityID INTEGER NOT NULL,
                    Name TEXT NOT NULL,
                    FOREIGN KEY (CityID) REFERENCES Cities(CityID) ON DELETE RESTRICT
                );

                -- 4. CLIENTS TABLE (Required for Colis Foreign Key mappings)
                CREATE TABLE IF NOT EXISTS Clients (
                    ClientID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Phone TEXT NOT NULL,
                    Address TEXT,
                    CountryID INTEGER,
                    CityID INTEGER,
                    RegionID INTEGER,
                    FOREIGN KEY (CountryID) REFERENCES Countries(CountryID) ON DELETE SET NULL,
                    FOREIGN KEY (CityID) REFERENCES Cities(CityID) ON DELETE SET NULL,
                    FOREIGN KEY (RegionID) REFERENCES Regions(RegionID) ON DELETE SET NULL
                );

                -- 5. COLIS TABLE
                CREATE TABLE IF NOT EXISTS Colis (
                    ColisID INTEGER PRIMARY KEY AUTOINCREMENT,
                    TrackingNumber TEXT NOT NULL UNIQUE,
                    SenderName TEXT NOT NULL,
                    SenderPhone TEXT NOT NULL,
                    SenderAddress TEXT,
                    SenderClientID INTEGER,
                    ReceiverName TEXT NOT NULL,
                    ReceiverPhone TEXT NOT NULL,
                    ReceiverCountryID INTEGER NOT NULL,
                    ReceiverCityID INTEGER NOT NULL,
                    ReceiverRegionID INTEGER,
                    ReceiverFullAddress TEXT NOT NULL,
                    ReceiverClientID INTEGER,
                    Weight REAL NOT NULL,
                    Description TEXT NULL,
                    Image1 BLOB,
                    Image2 BLOB,
                    Image3 BLOB,
                    DeliveryType TEXT NOT NULL CHECK(DeliveryType IN ('agency', 'home')),
                    TotalAmount REAL NOT NULL,
                    Status TEXT NOT NULL DEFAULT 'pending' CHECK(Status IN ('pending', 'transit', 'delivered', 'cancelled')),
                    Notes TEXT,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    DeliveredAt DATETIME,
                    FOREIGN KEY (SenderClientID) REFERENCES Clients(ClientID) ON DELETE SET NULL,
                    FOREIGN KEY (ReceiverClientID) REFERENCES Clients(ClientID) ON DELETE SET NULL,
                    FOREIGN KEY (ReceiverCountryID) REFERENCES Countries(CountryID) ON DELETE RESTRICT,
                    FOREIGN KEY (ReceiverCityID) REFERENCES Cities(CityID) ON DELETE RESTRICT,
                    FOREIGN KEY (ReceiverRegionID) REFERENCES Regions(RegionID) ON DELETE SET NULL
                );

                -- 6. STATUS HISTORY TABLE
                CREATE TABLE IF NOT EXISTS StatusHistory (
                    StatusHistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
                    ColisID INTEGER NOT NULL,
                    Status TEXT NOT NULL,
                    Notes TEXT,
                    ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (ColisID) REFERENCES Colis(ColisID) ON DELETE CASCADE
                );

                -- 7. USER TABLE
                CREATE TABLE IF NOT EXISTS User (
                    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Username TEXT NOT NULL UNIQUE,
                    PasswordHash TEXT NOT NULL
                );

                -- 8. BACKUPS TABLE
                CREATE TABLE IF NOT EXISTS Backups (
                    BackupID INTEGER PRIMARY KEY AUTOINCREMENT,
                    BackupPath TEXT NOT NULL,
                    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "seed_static_locations",
            sql: r#"
                INSERT OR IGNORE INTO Countries (CountryID, Name) VALUES (1, 'Morocco');
                -- You can cleanly append your 84 pre-loaded Moroccan city inserts here
            "#,
            kind: MigrationKind::Up,
        },
    ]
}