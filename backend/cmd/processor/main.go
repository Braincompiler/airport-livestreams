package main

import (
	"os"
	"time"

	"github.com/braincompiler/airportslive/internal/consts"
	"gofr.dev/pkg/gofr"
)

func main() {
	app := gofr.New()

	app.Logger().Debugf("process id: %d", os.Getpid())

	app.GET("/health", func(c *gofr.Context) (any, error) {
		return "Healthy", nil
	})

	app.Subscribe(consts.PubSubKeyYoutubeLivestreamsUpdated, func(ctx *gofr.Context) error {
		ctx.Logger.Infof("received pubsub message for topic %s at %v", consts.PubSubKeyYoutubeLivestreamsUpdated, time.Now())

		return LivestreamsUpdated(ctx)
	})

	app.Run()
}
