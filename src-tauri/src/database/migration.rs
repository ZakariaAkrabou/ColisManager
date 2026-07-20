use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: r#"
                -- 1. LOCATIONS TABLE
                CREATE TABLE IF NOT EXISTS Locations (
                    LocationID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Country TEXT NOT NULL,
                    City TEXT,
                    Region TEXT NOT NULL,
                    UNIQUE(Country, City, Region)
                );

                -- 2. CLIENTS TABLE
                CREATE TABLE IF NOT EXISTS Clients (
                    ClientID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Phone TEXT NOT NULL,
                    ClientType TEXT NOT NULL DEFAULT 'destinataire',
                    Address TEXT,
                    LocationID INTEGER,
                    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID) ON DELETE SET NULL
                );

                -- 3. COLIS TABLE
                CREATE TABLE IF NOT EXISTS Colis (
                    ColisID INTEGER PRIMARY KEY AUTOINCREMENT,
                    TrackingNumber TEXT NOT NULL UNIQUE,
                    SenderName TEXT NOT NULL,
                    SenderPhone TEXT NOT NULL,
                    SenderAddress TEXT,
                    SenderClientID INTEGER,
                    ReceiverName TEXT NOT NULL,
                    ReceiverPhone TEXT NOT NULL,
                    ReceiverLocationID INTEGER NOT NULL,
                    ReceiverFullAddress TEXT NOT NULL,
                    ReceiverClientID INTEGER,
                    Weight REAL NOT NULL,
                    Quantity INTEGER NOT NULL DEFAULT 1,
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
                    FOREIGN KEY (ReceiverLocationID) REFERENCES Locations(LocationID) ON DELETE RESTRICT
                );

                -- 4. STATUS HISTORY TABLE
                CREATE TABLE IF NOT EXISTS StatusHistory (
                    StatusHistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
                    ColisID INTEGER NOT NULL,
                    Status TEXT NOT NULL,
                    Notes TEXT,
                    ChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (ColisID) REFERENCES Colis(ColisID) ON DELETE CASCADE
                );

                -- 5. USER TABLE
                CREATE TABLE IF NOT EXISTS User (
                    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
                    Username TEXT NOT NULL UNIQUE,
                    PasswordHash TEXT NOT NULL
                );

                -- 6. BACKUPS TABLE
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
                INSERT OR IGNORE INTO Locations (LocationID, Country, City, Region) VALUES (1, 'Morocco', 'Casablanca', 'Casablanca-Settat');
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_quantity_to_colis",
            sql: r#"
                ALTER TABLE Colis ADD COLUMN Quantity INTEGER NOT NULL DEFAULT 1;
            "#,
            kind: MigrationKind::Up,
        },
    ]
}