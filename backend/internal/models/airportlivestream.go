package models

import "encoding/json"

type ThumbnailType string
type AirportLivestreamsOnYoutubeList []AirportLivestreamOnYoutube
type AirportLivestreamList []AirportLivestream

const (
	ThumbnailTypeDefault  ThumbnailType = "default"
	ThumbnailTypeMedium   ThumbnailType = "medium"
	ThumbnailTypeHigh     ThumbnailType = "high"
	ThumbnailTypeStandard ThumbnailType = "standard"
	ThumbnailTypeMaxres   ThumbnailType = "maxres"
)

type AirportLivestreamOnYoutube struct {
	Title        string                                `json:"title"`
	ChannelTitle string                                `json:"channelTitle"`
	Description  string                                `json:"description"`
	VideoId      string                                `json:"videoId"`
	ChannelId    string                                `json:"channelId"`
	Thumbnails   []AirportLivestreamOnYoutubeThumbnail `json:"thumbnails"`
}

type AirportLivestreamOnYoutubeThumbnail struct {
	Type   ThumbnailType `json:"type"`
	URL    string        `json:"url"`
	Width  int64         `json:"width"`
	Height int64         `json:"height"`
}

func (a AirportLivestreamsOnYoutubeList) MarshalBinary() ([]byte, error) {
	return json.Marshal(a)
}

func (a *AirportLivestreamsOnYoutubeList) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, a)
}

type AirportLivestream struct {
	Icao         string                                `json:"icao"`
	Iata         string                                `json:"iata"`
	Latitude     float64                               `json:"lat"`
	Longitude    float64                               `json:"lon"`
	YoutubeURL   string                                `json:"youtubeURL"`
	Title        string                                `json:"title"`
	Description  string                                `json:"description"`
	ChannelTitle string                                `json:"channelTitle"`
	Thumbnails   []AirportLivestreamOnYoutubeThumbnail `json:"thumbnails"`
}

// , lat, lon float64
func (a *AirportLivestreamOnYoutube) MapToAirportLivestream(icao, iata string) AirportLivestream {
	return AirportLivestream{
		Icao: icao,
		Iata: iata,
		// Latitude:     lat,
		// Longitude:    lon,
		Title:        a.Title,
		Description:  a.Description,
		ChannelTitle: a.ChannelTitle,
		Thumbnails:   a.Thumbnails,
		YoutubeURL:   "https://www.youtube.com/watch?v=" + a.VideoId, // https://www.youtube.com/watch?v=WezTqSbCIIQ
	}
}

func (a AirportLivestreamList) MarshalBinary() ([]byte, error) {
	return json.Marshal(a)
}

func (a *AirportLivestreamList) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, a)
}
