package model

type Item struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Description string `json:"description"`
	Image string `json:"image"`
	Reserve int64  `json:"reserve"`
	CurrentBid int64  `json:"currentBid"`
	Location string `json:"location"`
}