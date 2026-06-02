package repository

import (
	"database/sql"
	"fmt"
	"time"

	gocache "github.com/patrickmn/go-cache"
	"github.com/PursDios/testBidding/backend/internal/model"
)

const cacheKeyItems = "items"

type repo struct {
	db    *sql.DB
	cache *gocache.Cache
}

func New(db *sql.DB) *repo {
	return &repo{
		db:    db,
		cache: gocache.New(5*time.Minute, 10*time.Minute),
	}
}

func (r *repo) GetAll() ([]model.Item, error) {
	if cached, found := r.cache.Get(cacheKeyItems); found {
		return cached.([]model.Item), nil
	}

	rows, err := r.db.Query("SELECT id, title, description, image, reserve, current_bid, location FROM items")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []model.Item
	for rows.Next() {
		var item model.Item
		if err := rows.Scan(&item.ID, &item.Title, &item.Description, &item.Image, &item.Reserve, &item.CurrentBid, &item.Location); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	r.cache.Set(cacheKeyItems, items, gocache.DefaultExpiration)

	return items, nil
}

func (r *repo) InvalidateCache() {
	r.cache.Delete(cacheKeyItems)
}

func (r *repo) PlaceBid(itemID string, amount int64) (*model.Item, error) {
	res, err := r.db.Exec(
		"UPDATE items SET current_bid = ? WHERE id = ? AND current_bid < ?",
		amount, itemID, amount,
	)
	if err != nil {
		return nil, err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return nil, fmt.Errorf("bid too low or item not found")
	}

	r.cache.Delete(cacheKeyItems)

	var item model.Item
	err = r.db.QueryRow(
		"SELECT id, title, description, image, reserve, current_bid, location FROM items WHERE id = ?",
		itemID,
	).Scan(&item.ID, &item.Title, &item.Description, &item.Image, &item.Reserve, &item.CurrentBid, &item.Location)
	if err != nil {
		return nil, err
	}

	return &item, nil
}
