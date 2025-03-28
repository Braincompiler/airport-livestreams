package main

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/braincompiler/airportslive/internal/models"
	"github.com/braincompiler/airportslive/internal/util"
	"github.com/gocarina/gocsv"

	_ "github.com/lib/pq"
)

func importCountries(countries []*models.Country) {
	defer util.TimeTrack(time.Now(), "importCountries")

	db := getDB()

	id := "NOT_FOUND"
	err := db.QueryRow("SELECT id FROM countries LIMIT 1").Scan(&id)
	log.Printf("Test-ID: %s\n", id)

	switch {
	case err == sql.ErrNoRows:
		insertCountries(db, countries)
	case err != nil:
		panic(err)
	default:
		updateCountries(db, countries)
	}
}

func updateCountries(db *sql.DB, countries []*models.Country) {
	defer util.TimeTrack(time.Now(), "updateCountries")

	log.Println("Updating countries ...")

	tx, err := db.Begin()
	if err != nil {
		panic(err)
	}

	txOK := false
	defer func() {
		if !txOK {
			tx.Rollback()
		}
	}()

	for _, country := range countries {
		_, err = tx.Exec(`UPDATE countries
                SET code = $1,
                    name = $2,
                    continent = $3,
                    wikipedia_link = $4
                WHERE source_id = $5`,
			country.Code,
			country.Name,
			country.Continent,
			country.WikipediaLink,
			country.SourceId,
		)

		if err != nil {
			panic(err)
		}
	}

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
	txOK = true
}

func insertCountries(db *sql.DB, countries []*models.Country) {
	defer util.TimeTrack(time.Now(), "insertCountries")

	log.Println("Inserting countries ...")

	tx, err := db.Begin()
	if err != nil {
		panic(err)
	}

	txOK := false
	defer func() {
		if !txOK {
			tx.Rollback()
		}
	}()

	for _, country := range countries {
		_, err = db.Exec(`INSERT INTO countries
              (code, name, continent, wikipedia_link, source_id)
              VALUES ($1, $2, $3, $4, $5)`,
			country.Code,
			country.Name,
			country.Continent,
			country.WikipediaLink,
			country.SourceId,
		)

		if err != nil {
			panic(err)
		}
	}

	err = tx.Commit()
	if err != nil {
		panic(err)
	}
	txOK = true
}

func parseCountries(countriesCsvFileName string) []*models.Country {
	defer util.TimeTrack(time.Now(), "parseCountries")

	f, err := os.OpenFile(countriesCsvFileName, os.O_RDONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}

	defer f.Close()

	var countries []*models.Country

	err = gocsv.UnmarshalFile(f, &countries)
	if err != nil {
		panic(err)
	}

	return countries
}
