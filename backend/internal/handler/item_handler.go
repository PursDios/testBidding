package handler

import (
	"encoding/json"
	"net/http"

	"github.com/PursDios/testBidding/backend/internal/model"
)

type ItemService interface {
	GetAll() ([]model.Item, error)
}

type ItemHandler struct {
	service ItemService
}

func NewItemHandler(service ItemService) *ItemHandler {
	return &ItemHandler{service: service}
}

func (h *ItemHandler) GetItems(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.GetAll()
	if err != nil {
		http.Error(w, "failed to fetch items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}
