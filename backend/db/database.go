package db

import (
    "database/sql"
    "embed"
    "sync"
    "time"

    "github.com/golang-migrate/migrate/v4"
    "github.com/golang-migrate/migrate/v4/database/sqlite3"
    "github.com/golang-migrate/migrate/v4/source/iofs"
    _ "github.com/mattn/go-sqlite3"
)

//go:embed migrations/*.sql
var migrations embed.FS

var (
    instance *sql.DB
    once     sync.Once
)

func Connect() *sql.DB {
    once.Do(func() {
        db, err := sql.Open("sqlite3", "./data/bidding.db")
        if err != nil {
            panic(err)
        }
        db.SetMaxOpenConns(25)
        db.SetMaxIdleConns(5)
        db.SetConnMaxLifetime(5 * time.Minute)
        instance = db
    })
    return instance
}

func Migrate(db *sql.DB) error {
    source, err := iofs.New(migrations, "migrations")
    if err != nil {
        return err
    }

    driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
    if err != nil {
        return err
    }

    m, err := migrate.NewWithInstance("iofs", source, "sqlite3", driver)
    if err != nil {
        return err
    }

    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        return err
    }

    return nil
}
