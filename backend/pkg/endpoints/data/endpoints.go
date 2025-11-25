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

	// app.GET("/events", func(ctx *gofr.Context) (interface{}, error) {
	// 	w := ctx.Responder() // Get the http.ResponseWriter

	// 	response.Raw

	// 	// Set headers for SSE
	// 	w.Header().Set("Content-Type", "text/event-stream")
	// 	w.Header().Set("Cache-Control", "no-cache")
	// 	w.Header().Set("Connection", "keep-alive")
	// 	// Optional: Set Access-Control-Allow-Origin for cross-origin requests
	// 	w.Header().Set("Access-Control-Allow-Origin", "*")

	// 	// Get the Flusher interface to send incremental updates
	// 	flusher, ok := w.(http.Flusher)
	// 	if !ok {
	// 		ctx.Logger.Error("SSE: Streaming unsupported!")
	// 		return nil, errors.New("streaming unsupported")
	// 	}

	// 	ctx.Logger.Info("SSE: Client connected, starting event stream.")

	// 	// Example: Send a message every second.
	// 	// In a real application, you would replace this ticker with your actual event source.
	// 	// This could involve subscribing to gofr's PubSub, a message queue, or other event mechanisms.
	// 	ticker := time.NewTicker(1 * time.Second)
	// 	defer ticker.Stop()

	// 	for {
	// 		select {
	// 		case <-ctx.Done(): // Client disconnected
	// 			ctx.Logger.Info("SSE: Client disconnected.")
	// 			return nil, nil // Handler finished successfully

	// 		case t := <-ticker.C: // New event from our example ticker
	// 			// Format the event data (SSE format: "data: your_data\n\n")
	// 			// You can also specify event names ("event: your_event_name\n") or IDs ("id: your_event_id\n").
	// 			// Example: Sending JSON data
	// 			// jsonData, _ := json.Marshal(map[string]string{"time": t.Format(time.RFC3339)})
	// 			// eventData := fmt.Sprintf("data: %s\n\n", jsonData)

	// 			eventData := fmt.Sprintf("data: The server time is %s\n\n", t.Format(time.RFC1123))

	// 			_, err := fmt.Fprint(w, eventData)
	// 			if err != nil {
	// 				ctx.Logger.Errorf("SSE: Error writing to client: %v", err)
	// 				return nil, err // Terminate stream on write error
	// 			}

	// 			// Flush the data to the client to ensure it's sent immediately
	// 			flusher.Flush()
	// 			ctx.Logger.Debugf("SSE: Sent event at %s", t.Format(time.RFC1123))
	// 		}
	// 	}
	// 	// The gofr handler expects (interface{}, error).
	// 	// For SSE, the response body is handled by direct writes to http.ResponseWriter.
	// 	// The loop exits when the client disconnects (returning nil, nil) or an error occurs (returning nil, err).
	// })

	// app.GET("/events", func (ctx *gofr.Context) (any, error) {
	// 	ctx.

	// 	return response.Response{
	// 		Data: "Hello, World!",
	// 		Headers: map[string]string{
	// 			"Content-Type": "text/event-stream",
	// 			"Cache-Control": "no-cache",
	// 			"Connection": "keep-alive",
	// 		},
	// 	}, nil
	// })

	// http.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
	// 	w.Header().Set("Content-Type", "text/event-stream")
	// 	w.Header().Set("Cache-Control", "no-cache")
	// 	w.Header().Set("Connection", "keep-alive")

	// 	// w.Header().Set("Access-Control-Allow-Origin", "*")

	// 	clientGone := r.Context().Done()

	// 	rc := http.NewResponseController(w)
	// 	t := time.NewTicker(time.Second)
	// 	defer t.Stop()
	// 	for {
	// 		select {
	// 		case <-clientGone:
	// 			app.Logger().Info("SSE: Client disconnected")
	// 			return
	// 		case <-t.C:
	// 			// Send an event to the client
	// 			// Here we send only the "data" field, but there are few others
	// 			_, err := fmt.Fprintf(w, "data: The time is %s\n\n", time.Now().Format(time.UnixDate))
	// 			if err != nil {
	// 				app.Logger().Errorf("SSE: Error writing to client: %v", err)
	// 				return
	// 			}

	// 			err = rc.Flush()
	// 			if err != nil {
	// 				app.Logger().Errorf("SSE: Error flushing to client: %v", err)
	// 				return
	// 			}
	// 		}
	// 	}
	// })
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
