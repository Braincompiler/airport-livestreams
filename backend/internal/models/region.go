package models

type Region struct {
	Code          string `csv:"code" db:"code"`
	Name          string `csv:"name" db:"name"`
	Continent     string `csv:"continent" db:"continent"`
	IsoCountry    string `csv:"iso_country" db:"iso_country"`
	WikipediaLink string `csv:"wikipedia_link" db:"wikipedia_link"`

	SourceId int `csv:"id" db:"source_id"`
}
