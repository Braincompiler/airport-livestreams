package services

import (
	"fmt"
	"time"

	"github.com/braincompiler/airportslive/internal/models"
	"github.com/braincompiler/airportslive/internal/util"
	"gofr.dev/pkg/gofr"
)

type AirportsService interface {
	GetAll(*gofr.Context, []string) ([]models.AirportListItem, error)
	GetAllGroupedByContinent(*gofr.Context, []string) (map[string][]models.AirportListItem, error)
}

type airportsService struct{}

func NewAirportsService() AirportsService {
	return &airportsService{}
}

func (s *airportsService) GetAll(ctx *gofr.Context, types []string) ([]models.AirportListItem, error) {
	defer util.TimeTrack(time.Now(), "AirportsService.GetAll")

	// @TODO Validate the types (closed, large_airport, medium_airport, seaplane_base, small_airport) // balloonport, heliport

	t := "'large_airport', 'medium_airport'"
	if len(types) > 0 {
		t = util.GetAsListForInClause(types)
	}

	rows, err := ctx.SQL.QueryContext(ctx, fmt.Sprintf(`
		SELECT id, icao, TRIM(iata), name, latitude, longitude, elevation, home_link, wikipedia_link
		FROM airports
		WHERE type IN(%s)`, t),
	)
	if err != nil {
		return nil, err
	}

	var airports []models.AirportListItem
	for rows.Next() {
		var airport models.AirportListItem
		if err := rows.Scan(
			&airport.Id,
			&airport.Icao,
			&airport.Iata,
			&airport.Name,
			&airport.Latitude,
			&airport.Longitude,
			&airport.Elevation,
			&airport.HomeLink,
			&airport.WikipediaLink,
		); err != nil {
			return nil, err
		}

		airports = append(airports, airport)
	}

	return airports, nil
}

func (s *airportsService) GetAllGroupedByContinent(ctx *gofr.Context, types []string) (map[string][]models.AirportListItem, error) {
	defer util.TimeTrack(time.Now(), "AirportsService.GetAllGroupedByContinent")

	t := "'large_airport', 'medium_airport'"
	if len(types) > 0 {
		t = util.GetAsListForInClause(types)
	}

	rows, err := ctx.SQL.QueryContext(ctx, fmt.Sprintf(`
		SELECT id, icao, TRIM(iata), name, latitude, longitude, elevation, home_link, wikipedia_link, continent
		FROM airports
		WHERE type IN(%s)`, t),
	)
	if err != nil {
		return nil, err
	}

	var airports = make(map[string][]models.AirportListItem)
	for rows.Next() {
		var continent string
		var airport models.AirportListItem
		if err := rows.Scan(
			&airport.Id,
			&airport.Icao,
			&airport.Iata,
			&airport.Name,
			&airport.Latitude,
			&airport.Longitude,
			&airport.Elevation,
			&airport.HomeLink,
			&airport.WikipediaLink,
			&continent,
		); err != nil {
			return nil, err
		}

		airports[continent] = append(airports[continent], airport)
	}

	return airports, nil
}
