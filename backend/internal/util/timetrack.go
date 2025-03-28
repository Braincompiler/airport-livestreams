package util

import (
	"log"
	"time"
)

func TimeTrack(start time.Time, name string) {
	elapsed := time.Since(start)
	log.Printf(">>> TimeTrack: %s took %s\n", name, elapsed)
}
