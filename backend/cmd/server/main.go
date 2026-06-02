package main

import (
	"fmt"
	"io/fs"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/PursDios/testBidding/backend/db"
	"github.com/PursDios/testBidding/backend/internal/handler"
	"github.com/PursDios/testBidding/backend/internal/hub"
	"github.com/PursDios/testBidding/backend/internal/repository"
	"github.com/PursDios/testBidding/backend/internal/service"
)

func main() {
	fmt.Println("Server starting...")

	database := db.Connect()
	if err := db.Migrate(database); err != nil {
		panic(err)
	}
	if err := db.Seed(database); err != nil {
		panic(err)
	}

	wsHub := hub.New()
	go wsHub.Run()

	itemRepo := repository.New(database)
	itemService := service.New(itemRepo)
	itemHandler := handler.NewItemHandler(itemService)
	bidHandler := handler.NewBidHandler(itemService, wsHub)
	resetHandler := handler.NewResetHandler(database, wsHub, itemRepo)

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "https://pursdios.github.io"},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	}))

	imageFS, _ := fs.Sub(db.Images, "images")
	r.Handle("/images/*", http.StripPrefix("/images/", http.FileServer(http.FS(imageFS))))
	r.Get("/api/items", itemHandler.GetItems)
	r.Post("/api/bids", bidHandler.PlaceBid)
	r.Post("/api/reset", resetHandler.Reset)
	r.Get("/ws", bidHandler.ServeWs)

	fmt.Println("Listening on :8080")
	http.ListenAndServe(":8080", r)
}
