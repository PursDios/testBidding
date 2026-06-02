package handler

import (
	"database/sql"
	"net/http"

	"github.com/PursDios/testBidding/backend/db"
	"github.com/PursDios/testBidding/backend/internal/hub"
)

type CacheInvalidator interface {
	InvalidateCache()
}

type ResetHandler struct {
	database *sql.DB
	hub      *hub.Hub
	repo     CacheInvalidator
}

func NewResetHandler(database *sql.DB, h *hub.Hub, repo CacheInvalidator) *ResetHandler {
	return &ResetHandler{database: database, hub: h, repo: repo}
}

func (h *ResetHandler) Reset(w http.ResponseWriter, r *http.Request) {
	if err := db.Reset(h.database); err != nil {
		http.Error(w, "reset failed", http.StatusInternalServerError)
		return
	}

	h.repo.InvalidateCache()
	h.hub.Broadcast(map[string]string{"type": "reset"})

	w.WriteHeader(http.StatusNoContent)
}
