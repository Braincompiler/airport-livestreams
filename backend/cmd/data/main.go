package main

import (
	"os"

	"github.com/braincompiler/airportslive/pkg/endpoints"
	"gofr.dev/pkg/gofr"
)

func main() {
	app := gofr.New()

	app.Logger().Debugf("process id: %d", os.Getpid())

	endpoints.AddEndpoints(app)

	app.GET("/health", func(c *gofr.Context) (interface{}, error) {
		_, err := c.SQL.QueryContext(c, "SELECT 1")
		if err != nil {
			return nil, err
		}

		return "Healthy", nil
	})

	app.Run()
}
