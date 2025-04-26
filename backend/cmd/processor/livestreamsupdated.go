package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"slices"
	"strings"

	"github.com/braincompiler/airportslive/internal/consts"
	"github.com/braincompiler/airportslive/internal/models"
	"github.com/redis/go-redis/v9"
	"gofr.dev/pkg/gofr"
)

type matchAirport struct {
	icao      string
	iata      string
	name      string
	latitude  float64
	longitude float64
}
type matchAirportList []matchAirport

var (
	SKIPPED_IATAS []string = []string{"ATC", "USA", "ADS", "AND"}
)

func LivestreamsUpdated(ctx *gofr.Context) error {
	val, err := ctx.Redis.Get(ctx, consts.CacheKeyYoutubeLivestreams).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		// If the key is not found, we are not considering this an error and returning ""
		return err
	}

	var livestreams models.AirportLivestreamsOnYoutubeList
	if err := json.Unmarshal([]byte(val), &livestreams); err != nil {
		return err
	}

	rows, err := ctx.SQL.QueryContext(ctx, fmt.Sprintf(`SELECT icao, TRIM(iata), name, latitude, longitude FROM airports WHERE type != 'closed' AND LENGTH(icao) = 4`)) // check if icao is exactly 4 characters
	if err != nil {
		return err
	}

	var matchAirports matchAirportList
	for rows.Next() {
		var matchAirport = matchAirport{}
		if err := rows.Scan(&matchAirport.icao, &matchAirport.iata, &matchAirport.name, &matchAirport.latitude, &matchAirport.longitude); err != nil {
			return err
		}

		matchAirports = append(matchAirports, matchAirport)
	}

	icaoRegexp := matchAirports.icaoRegexp()
	iataRegexp := matchAirports.iataRegexp()
	var finalLivestreams models.AirportLivestreamList

	for _, livestream := range livestreams {
		title := livestream.Title
		description := livestream.Description

		// TODO: Find out if the livestream is pre-recorded

		foundIcao := icaoRegexp.FindString(title)
		if foundIcao != "" {
			ctx.Logger.Debugf("Found ICAO: %s in title %s\n", foundIcao, title)
			matchAirport := matchAirports.findByIcao(foundIcao)
			finalLivestreams = append(finalLivestreams, livestream.MapToAirportLivestream(foundIcao, matchAirport.iata))
			continue
		}

		foundIcao = icaoRegexp.FindString(description)
		if foundIcao != "" {
			ctx.Logger.Debugf("Found ICAO: %s in description %s\n", foundIcao, description)
			matchAirport := matchAirports.findByIcao(foundIcao)
			finalLivestreams = append(finalLivestreams, livestream.MapToAirportLivestream(foundIcao, matchAirport.iata))
			continue
		}

		foundMatchAirport, name := findAirportByName(matchAirports.names(), livestream, matchAirports)
		if foundMatchAirport != nil {
			ctx.Logger.Debugf("Found airport name: %s in title %s or description %s\n", name, title, description)
			finalLivestreams = append(finalLivestreams, livestream.MapToAirportLivestream(foundMatchAirport.icao, foundMatchAirport.iata))

			continue
		}

		foundIata := iataRegexp.FindString(title)
		if foundIata != "" {
			ctx.Logger.Debugf("Found IATA: %s in title %s\n", foundIata, title)
			matchAirport := matchAirports.findByIata(foundIata)
			finalLivestreams = append(finalLivestreams, livestream.MapToAirportLivestream(matchAirport.icao, foundIata))
			continue
		}

		foundIata = iataRegexp.FindString(description)
		if foundIata != "" {
			ctx.Logger.Debugf("Found IATA: %s in description %s\n", foundIata, description)
			matchAirport := matchAirports.findByIata(foundIata)
			finalLivestreams = append(finalLivestreams, livestream.MapToAirportLivestream(matchAirport.icao, foundIata))
			continue
		}
	}

	if finalLivestreams == nil {
		finalLivestreams = models.AirportLivestreamList{}
	}

	_, err = ctx.Redis.Set(ctx.Context, consts.CacheKeyLivestreams, finalLivestreams, 0 /* 3*time.Hour */).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		ctx.Error(errors.Join(errors.New(fmt.Sprintf("failed to set cache for key '%s'", consts.CacheKeyLivestreams)), err))
	}

	return nil
}

func findAirportByName(names []string, livestream models.AirportLivestreamOnYoutube, matchAirports matchAirportList) (*matchAirport, string) {
	for _, name := range names {
		if strings.Contains(livestream.Title, name) || strings.Contains(livestream.Description, name) {
			matchAirport := matchAirports.findByName(name)

			return matchAirport, name
		}
	}

	return nil, ""
}

func (ma matchAirportList) icaos() []string {
	var icaos []string
	for _, airport := range ma {
		if airport.icao != "" {
			icaos = append(icaos, airport.icao)
		}
	}

	return icaos
}

func (ma matchAirportList) iatas() []string {
	var iatas []string
	for _, airport := range ma {
		if airport.iata != "" && !slices.Contains(SKIPPED_IATAS, airport.iata) {
			iatas = append(iatas, airport.iata)
		}
	}

	return iatas
}

func (ma matchAirportList) names() []string {
	var names []string
	for _, airport := range ma {
		if airport.name != "" {
			names = append(names, airport.name)
		}
	}

	return names
}

func (ma *matchAirportList) icaoRegexp() *regexp.Regexp {
	s := fmt.Sprintf(`\b(%s)\b`, strings.Join(ma.icaos(), "|"))
	println(s)

	return regexp.MustCompile(s)
}

func (ma *matchAirportList) iataRegexp() *regexp.Regexp {
	s := fmt.Sprintf(`\b(%s)\b`, strings.Join(ma.iatas(), "|"))
	println(s)

	return regexp.MustCompile(s)
}

func (ma *matchAirportList) findByIcao(icao string) *matchAirport {
	for _, airport := range *ma {
		if airport.icao == icao {
			return &airport
		}
	}

	return nil
}

func (ma *matchAirportList) findByIata(iata string) *matchAirport {
	for _, airport := range *ma {
		if airport.iata == iata {
			return &airport
		}
	}

	return nil
}

func (ma *matchAirportList) findByName(name string) *matchAirport {
	for _, airport := range *ma {
		if airport.name == name {
			return &airport
		}
	}

	return nil
}
