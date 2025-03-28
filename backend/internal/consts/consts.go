package consts

type CacheKey = string
type PubSubKey = string

const (
	CacheKeyYoutubeLivestreams CacheKey = "airportslive:yt:livestreams"
	CacheKeyLivestreams        CacheKey = "airportslive:livestreams"
)

const (
	PubSubKeyYoutubeLivestreamsUpdated PubSubKey = "airportslive:yt:livestreams:updated"
)
