package service

import (
	"github.com/PursDios/testBidding/backend/internal/model"
)

type ItemRepository interface {
	GetAll() ([]model.Item, error)
	InvalidateCache()
	PlaceBid(itemID string, amount int64) (*model.Item, error)
}

type itemService struct {
	repo ItemRepository
}

func New(repo ItemRepository) *itemService {
	return &itemService{repo: repo}
}

func (s *itemService) GetAll() ([]model.Item, error) {
	return s.repo.GetAll()
}

func (s *itemService) PlaceBid(itemID string, amount int64) (*model.Item, error) {
	return s.repo.PlaceBid(itemID, amount)
}
