package data

import (
	"github.com/braincompiler/airportslive/pkg/services"
	"gofr.dev/pkg/gofr"
)

func AddEndpoints(app *gofr.App) {
	airportSvc := services.NewAirportsService()
	livestreamsSvc := services.NewLivestreamsService()

	app.GET("/airports", MakeGetAll(airportSvc))
	app.GET("/airports/grouped-by-continent", MakeGetAllGroupedByContinent(airportSvc))
	app.GET("/livestreams", MakeGetAllLivestreams(livestreamsSvc))
}

func MakeGetAll(svc services.AirportsService) gofr.Handler {
	return func(ctx *gofr.Context) (any, error) {
		types := ctx.Request.Params("type")

		return svc.GetAll(ctx, types)
	}
}

func MakeGetAllGroupedByContinent(svc services.AirportsService) gofr.Handler {
	return func(ctx *gofr.Context) (any, error) {
		types := ctx.Request.Params("type")

		return svc.GetAllGroupedByContinent(ctx, types)
	}
}

func MakeGetAllLivestreams(svc services.LivestreamsService) gofr.Handler {
	return func(ctx *gofr.Context) (any, error) {
		return svc.GetAll(ctx)
	}
}
