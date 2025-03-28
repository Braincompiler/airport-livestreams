package services

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/braincompiler/airportslive/internal/consts"
	"github.com/braincompiler/airportslive/internal/models"
	"github.com/braincompiler/airportslive/internal/util"
	"github.com/redis/go-redis/v9"
	"gofr.dev/pkg/gofr"
)

type LivestreamsService interface {
	GetAll(*gofr.Context) (models.AirportLivestreamList, error)
}

type livestreamsService struct{}

func NewLivestreamsService() LivestreamsService {
	return &livestreamsService{}
}

func (s *livestreamsService) GetAll(ctx *gofr.Context) (models.AirportLivestreamList, error) {
	defer util.TimeTrack(time.Now(), "LivestreamsService.GetAll")

	val, err := ctx.Redis.Get(ctx, consts.CacheKeyLivestreams).Result()
	if err != nil && !errors.Is(err, redis.Nil) {
		// If the key is not found, we are not considering this an error and returning ""
		return nil, err
	}

	var livestreams models.AirportLivestreamList
	if err := json.Unmarshal([]byte(val), &livestreams); err != nil {
		return nil, err
	}

	return livestreams, nil
}
