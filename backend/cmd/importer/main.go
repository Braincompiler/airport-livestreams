package main

import (
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/braincompiler/airportslive/internal/util"
	"github.com/joho/godotenv"

	_ "github.com/lib/pq"
)

func main() {
	defer util.TimeTrack(time.Now(), "Complete import")

	godotenv.Load()

	// https://ourairports.com/data/
	airportsCsvFileName := os.Args[1]
	countriesCsvFileName := os.Args[2]
	regionsCsvFileName := os.Args[3]

	log.Printf("Airports file %s\n", airportsCsvFileName)
	log.Printf("Countries file %s\n", countriesCsvFileName)
	log.Printf("Regions file %s\n", regionsCsvFileName)

	airports := parseAirports(airportsCsvFileName)
	log.Printf("Parsed %d airports\n", len(airports))

	countries := parseCountries(countriesCsvFileName)
	log.Printf("Parsed %d countries\n", len(countries))

	regions := parseRegions(regionsCsvFileName)
	log.Printf("Parsed %d regions\n", len(regions))

	randomAirport := airports[rand.Intn(len(airports))]
	log.Printf("Random airport: %s (%s) [%f;%f]\n",
		randomAirport.Name, randomAirport.Icao, randomAirport.Latitude, randomAirport.Longitude)

	randomCountry := countries[rand.Intn(len(countries))]
	log.Printf("Random country: %s (%s)\n",
		randomCountry.Name, randomCountry.Continent)

	randomRegion := regions[rand.Intn(len(regions))]
	log.Printf("Random region: %s (%s, %s)\n",
		randomRegion.Name, randomRegion.Continent, randomRegion.IsoCountry)

	importAirports(airports)
	importCountries(countries)
	importRegions(regions)
}
