package main

import (
	"os"

	"github.com/braincompiler/airportslive/cmd/cronjobs/yt"
	"github.com/braincompiler/airportslive/internal/env"
	"gofr.dev/pkg/gofr"
)

func main() {
	app := gofr.New()

	app.Logger().Debugf("process id: %d", os.Getpid())

	app.GET("/health", func(c *gofr.Context) (interface{}, error) {
		return "Healthy", nil
	})

	app.AddCronJob(env.EnvString("CRON_SCHEDULE_YT_QUERYLIVESTREAMS", "0 */1 * * *"), "yt::query-livestreams", yt.QueryLivestreams(app.Logger()))

	app.Run()
}
