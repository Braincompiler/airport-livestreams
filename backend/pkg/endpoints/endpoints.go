package endpoints

import (
	"github.com/braincompiler/airportslive/pkg/endpoints/data"
	"gofr.dev/pkg/gofr"
)

func AddEndpoints(app *gofr.App) {
	data.AddEndpoints(app)
}
