package handler

import (
	"encoding/json"
	"net/http"

	"github.com/PursDios/testBidding/backend/internal/hub"
	"github.com/PursDios/testBidding/backend/internal/model"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type BidService interface {
	PlaceBid(itemID string, amount int64) (*model.Item, error)
}

type BidHandler struct {
	service BidService
	hub     *hub.Hub
}

func NewBidHandler(service BidService, h *hub.Hub) *BidHandler {
	return &BidHandler{service: service, hub: h}
}

type bidRequest struct {
	ItemID string `json:"itemId"`
	Amount int64  `json:"amount"`
}

type bidEvent struct {
	Type string     `json:"type"`
	Item model.Item `json:"item"`
}

func (h *BidHandler) PlaceBid(w http.ResponseWriter, r *http.Request) {
	var req bidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.ItemID == "" || req.Amount <= 0 {
		http.Error(w, "itemId and amount are required", http.StatusBadRequest)
		return
	}

	item, err := h.service.PlaceBid(req.ItemID, req.Amount)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.hub.Broadcast(bidEvent{Type: "bid_placed", Item: *item})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func (h *BidHandler) ServeWs(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	h.hub.ServeClient(conn)
}
