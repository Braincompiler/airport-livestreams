package models

import (
	"github.com/google/uuid"
)

type AirportCSV struct {
	Icao          string  `csv:"ident"`
	Type          string  `csv:"type"`
	Name          string  `csv:"name"`
	Latitude      float64 `csv:"latitude_deg"`
	Longitude     float64 `csv:"longitude_deg"`
	Elevation     int     `csv:"elevation_ft"`
	Continent     string  `csv:"continent"`
	IsoCountry    string  `csv:"iso_country"`
	IsoRegion     string  `csv:"iso_region"`
	Municipality  string  `csv:"municipality"`
	IataCode      string  `csv:"iata_code"`
	HomeLink      string  `csv:"home_link"`
	WikipediaLink string  `csv:"wikipedia_link"`

	SourceId int `csv:"id"`
}

type AirportListItem struct {
	Id            uuid.UUID `json:"id" db:"id"`
	Icao          string    `json:"icao" db:"icao"`
	Iata          string    `json:"iata,omitempty" db:"iata"`
	Name          string    `json:"name" db:"name"`
	Latitude      float64   `json:"lat" db:"latitude"`
	Longitude     float64   `json:"lon" db:"longitude"`
	Elevation     int       `json:"elevation,omitempty" db:"elevation"`
	HomeLink      string    `json:"homeLink,omitempty" db:"home_link"`
	WikipediaLink string    `json:"wikipediaLink,omitempty" db:"wikipedia_link"`
}

type AirportDTO struct {
	*AirportListItem

	Type         string `json:"type" db:"type"`
	Continent    string `json:"continent" db:"continent"`
	Country      string `json:"country" db:"iso_country"`
	Region       string `json:"region" db:"iso_region"`
	Municipality string `json:"municipality,omitempty" db:"municipality"`

	SourceId int `json:"sourceId" db:"source_id"`
}
