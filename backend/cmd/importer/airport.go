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

func importAirports(airports []*models.AirportCSV) {
	defer util.TimeTrack(time.Now(), "importAirports")

	db := getDB()

	id := "NOT_FOUND"
	err := db.QueryRow("SELECT id FROM airports LIMIT 1").Scan(&id)
	log.Printf("Test-ID: %s\n", id)

	switch {
	case err == sql.ErrNoRows:
		insertAirports(db, airports)
	case err != nil:
		panic(err)
	default:
		updateAirports(db, airports)
	}
}

func updateAirports(db *sql.DB, airports []*models.AirportCSV) {
	defer util.TimeTrack(time.Now(), "updateAirports")

	log.Println("Updating airports ...")

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

	for _, airport := range airports {
		_, err = tx.Exec(`UPDATE airports
                SET icao = $1,
                    type = $2,
                    name = $3,
                    latitude = $4,
                    longitude = $5,
                    elevation = $6,
                    continent = $7,
                    iso_country = $8,
                    iso_region = $9,
                    municipality = $10,
                    iata = $11,
                    home_link = $12,
                    wikipedia_link = $13
                WHERE source_id = $14`,
			airport.Icao,
			airport.Type,
			airport.Name,
			airport.Latitude,
			airport.Longitude,
			airport.Elevation,
			airport.Continent,
			airport.IsoCountry,
			airport.IsoRegion,
			airport.Municipality,
			airport.IataCode,
			airport.HomeLink,
			airport.WikipediaLink,
			airport.SourceId,
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

func insertAirports(db *sql.DB, airports []*models.AirportCSV) {
	defer util.TimeTrack(time.Now(), "insertAirports")

	log.Println("Inserting airports ...")

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

	for _, airport := range airports {
		_, err = db.Exec(`INSERT INTO airports
              (icao, type, name, latitude, longitude, elevation, continent, iso_country, iso_region, municipality, iata, home_link, wikipedia_link, source_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
			airport.Icao,
			airport.Type,
			airport.Name,
			airport.Latitude,
			airport.Longitude,
			airport.Elevation,
			airport.Continent,
			airport.IsoCountry,
			airport.IsoRegion,
			airport.Municipality,
			airport.IataCode,
			airport.HomeLink,
			airport.WikipediaLink,
			airport.SourceId,
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

func parseAirports(airportsCsvFileName string) []*models.AirportCSV {
	defer util.TimeTrack(time.Now(), "parseAirports")

	f, err := os.OpenFile(airportsCsvFileName, os.O_RDONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}

	defer f.Close()

	var airports []*models.AirportCSV

	err = gocsv.UnmarshalFile(f, &airports)
	if err != nil {
		panic(err)
	}

	return airports
}
