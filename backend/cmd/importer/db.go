package main

import (
	"database/sql"
	"fmt"

	"github.com/braincompiler/airportslive/internal/env"
)

func getDB() *sql.DB {
	connString := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		env.EnvString("DB_HOST", "NOT_SET"), env.EnvString("DB_PORT", "NOT_SET"),
		env.EnvString("DB_USER", "NOT_SET"), env.EnvString("DB_PASSWORD", "NOT_SET"),
		env.EnvString("DB_NAME", "NOT_SET"), env.EnvString("DB_SSL_MODE", "disable"),
	)

	db, err := sql.Open(env.EnvString("DB_DIALECT", "NOT_SET"), connString)
	if err != nil {
		panic(err)
	}

	return db
}
