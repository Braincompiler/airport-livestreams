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

func importRegions(regions []*models.Region) {
	defer util.TimeTrack(time.Now(), "importRegions")

	db := getDB()

	id := "NOT_FOUND"
	err := db.QueryRow("SELECT id FROM regions LIMIT 1").Scan(&id)
	log.Printf("Test-ID: %s\n", id)

	switch {
	case err == sql.ErrNoRows:
		insertRegions(db, regions)
	case err != nil:
		panic(err)
	default:
		updateRegions(db, regions)
	}
}

func updateRegions(db *sql.DB, regions []*models.Region) {
	defer util.TimeTrack(time.Now(), "updateRegions")

	log.Println("Updating regions ...")

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

	for _, region := range regions {
		_, err = tx.Exec(`UPDATE regions
                SET code = $1,
                    name = $2,
                    continent = $3,
                    wikipedia_link = $4,
					iso_country = $5
                WHERE source_id = $6`,
			region.Code,
			region.Name,
			region.Continent,
			region.WikipediaLink,
			region.IsoCountry,
			region.SourceId,
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

func insertRegions(db *sql.DB, regions []*models.Region) {
	defer util.TimeTrack(time.Now(), "insertRegions")

	log.Println("Inserting regions ...")

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

	for _, region := range regions {
		_, err = db.Exec(`INSERT INTO regions
              (code, name, continent, wikipedia_link, iso_country, source_id)
              VALUES ($1, $2, $3, $4, $5, $6)`,
			region.Code,
			region.Name,
			region.Continent,
			region.WikipediaLink,
			region.IsoCountry,
			region.SourceId,
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

func parseRegions(regionsCsvFileName string) []*models.Region {
	defer util.TimeTrack(time.Now(), "parseRegions")

	f, err := os.OpenFile(regionsCsvFileName, os.O_RDONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}

	defer f.Close()

	var regions []*models.Region

	err = gocsv.UnmarshalFile(f, &regions)
	if err != nil {
		panic(err)
	}

	return regions
}
