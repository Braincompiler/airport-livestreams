package yt

import (
	"errors"
	"fmt"
	"time"

	"github.com/braincompiler/airportslive/internal/consts"
	"github.com/braincompiler/airportslive/internal/env"
	"github.com/braincompiler/airportslive/internal/models"
	"github.com/braincompiler/airportslive/internal/util"
	"github.com/redis/go-redis/v9"
	"gofr.dev/pkg/gofr"
	"gofr.dev/pkg/gofr/logging"
	"google.golang.org/api/option"
	"google.golang.org/api/youtube/v3"
)

func QueryLivestreams(logger logging.Logger) gofr.CronFunc {
	return func(ctx *gofr.Context) {
		svc, err := youtube.NewService(ctx, option.WithAPIKey(env.EnvString("YT_API_KEY", "")))
		if err != nil {
			ctx.Errorf("failed to create youtube service: %v", err)

			return
		}

		ctx.Logger.Infof("current time is %v", time.Now())

		QueryAirportLivestreams(svc, logger, ctx)
	}
}

func QueryAirportLivestreams(svc *youtube.Service, logger logging.Logger, ctx *gofr.Context) {
	totalResults := 0
	totalPages := 0
	var livestreams models.AirportLivestreamsOnYoutubeList

	err := svc.Search.
		List([]string{"snippet"}).
		Type("video").
		EventType("live"). // @TODO: support for "upcoming" events?
		Q("airport live | airportlive | airportslive | flughafen | planespotter | planespotting | avgeeks").
		SafeSearch("none").
		Order("relevance").
		MaxResults(50).
		// PublishedAfter(time.Now().Add(-24 * time.Hour).Format(time.RFC3339)). // @TODO: Use the last time we queried
		Pages(ctx, func(slr *youtube.SearchListResponse) error {
			for _, item := range slr.Items {
				livestream := models.AirportLivestreamOnYoutube{
					Title:        util.RemoveZeroWidthSpace(item.Snippet.Title),
					Description:  util.RemoveZeroWidthSpace(item.Snippet.Description),
					ChannelTitle: item.Snippet.ChannelTitle,
					VideoId:      item.Id.VideoId,
					ChannelId:    item.Snippet.ChannelId,
					// Thumbnails:   extractThumbnails(item),
				}

				livestreams = append(livestreams, livestream)

				totalResults++
			}

			totalPages++

			return nil
		})

	if err != nil {
		ctx.Errorf("failed to query livestreams: %v", err)

		return
	}

	logger.Infof("Found %d livestreams in total", totalResults)
	logger.Infof("Found %d pages in total", totalPages)

	_, err = ctx.Redis.Set(ctx.Context, consts.CacheKeyYoutubeLivestreams, livestreams, 0 /* 3*time.Hour */).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		ctx.Error(errors.Join(errors.New(fmt.Sprintf("failed to set cache for key '%s'", consts.CacheKeyYoutubeLivestreams)), err))
	}

	ctx.GetPublisher().Publish(ctx.Context, consts.PubSubKeyYoutubeLivestreamsUpdated, nil)
}

// func extractThumbnails(item *youtube.SearchResult) []models.AirportLivestreamOnYoutubeThumbnail {
// 	thumbnails := make([]models.AirportLivestreamOnYoutubeThumbnail, 0)
// 	ytThumbnails := item.Snippet.Thumbnails

// 	if ytThumbnails.Default != nil {
// 		thumbnails = append(thumbnails, models.AirportLivestreamOnYoutubeThumbnail{
// 			Type:   models.ThumbnailTypeDefault,
// 			URL:    ytThumbnails.Default.Url,
// 			Width:  ytThumbnails.Default.Width,
// 			Height: ytThumbnails.Default.Height,
// 		})
// 	}

// 	if ytThumbnails.Medium != nil {
// 		thumbnails = append(thumbnails, models.AirportLivestreamOnYoutubeThumbnail{
// 			Type:   models.ThumbnailTypeMedium,
// 			URL:    ytThumbnails.Medium.Url,
// 			Width:  ytThumbnails.Medium.Width,
// 			Height: ytThumbnails.Medium.Height,
// 		})
// 	}

// 	if ytThumbnails.High != nil {
// 		thumbnails = append(thumbnails, models.AirportLivestreamOnYoutubeThumbnail{
// 			Type:   models.ThumbnailTypeHigh,
// 			URL:    ytThumbnails.High.Url,
// 			Width:  ytThumbnails.High.Width,
// 			Height: ytThumbnails.High.Height,
// 		})
// 	}

// 	if ytThumbnails.Standard != nil {
// 		thumbnails = append(thumbnails, models.AirportLivestreamOnYoutubeThumbnail{
// 			Type:   models.ThumbnailTypeStandard,
// 			URL:    ytThumbnails.Standard.Url,
// 			Width:  ytThumbnails.Standard.Width,
// 			Height: ytThumbnails.Standard.Height,
// 		})
// 	}

// 	if ytThumbnails.Maxres != nil {
// 		thumbnails = append(thumbnails, models.AirportLivestreamOnYoutubeThumbnail{
// 			Type:   models.ThumbnailTypeMaxres,
// 			URL:    ytThumbnails.Maxres.Url,
// 			Width:  ytThumbnails.Maxres.Width,
// 			Height: ytThumbnails.Maxres.Height,
// 		})
// 	}

// 	return thumbnails
// }

// func logItem(item *youtube.SearchResult, logger logging.Logger, idx int) {
// 	logger.Debugf("%d.) %s at channel %s (https://www.youtube.com/watch?v=%s)",
// 		idx, item.Snippet.Title, item.Snippet.ChannelTitle, item.Id.VideoId)
// }
