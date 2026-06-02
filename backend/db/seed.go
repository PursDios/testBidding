package db

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/PursDios/testBidding/backend/internal/model"
)

var seedItems = []model.Item{
	{
		Title:       "2012 Aston Martin One-77",
		Description: "One of only 77 ever produced, the Aston Martin One-77 represents the pinnacle of British automotive craftsmanship. Powered by a naturally aspirated 7.3L V12 producing 750bhp, this is a true collector's unicorn.",
		Image:       "/images/1.jpg",
		Reserve:     280000000,
		Location:    "London, UK",
	},
	{
		Title:       "2024 Rolls-Royce Phantom 'Goldfinger' (1 of 1)",
		Description: "A one-of-one bespoke commission finished in hand-laid 24-carat gold leaf with a Starlight Headliner featuring 1,344 individually placed fibre optic lights. The most exclusive Phantom ever produced.",
		Image:       "/images/2.webp",
		Reserve:     95000000,
		Location:    "Geneva, Switzerland",
	},
	{
		Title:       "2017 LaFerrari Aperta",
		Description: "The open-top variant of Ferrari's hybrid hypercar masterpiece. One of just 210 built, the LaFerrari Aperta combines a 6.3L V12 with a 163bhp electric motor for a combined 950bhp. A modern legend.",
		Image:       "/images/3.jpg",
		Reserve:     520000000,
		Location:    "Maranello, Italy",
	},
	{
		Title:       "2024 Bugatti Mistral",
		Description: "The world's most powerful open-top production car. The Bugatti Mistral is powered by the iconic 8.0L quad-turbocharged W16 engine producing 1,600bhp. One of only 99 examples ever to be built.",
		Image:       "/images/4.png",
		Reserve:     750000000,
		Location:    "Molsheim, France",
	},
	{
		Title:       "2018 McLaren 570S Convertible",
		Description: "The Spider variant of McLaren's most accessible supercar. A 3.8L twin-turbocharged V8 delivers 562bhp with a retractable hardtop that opens in just 15 seconds. The perfect everyday supercar.",
		Image:       "/images/5.webp",
		Reserve:     18500000,
		Location:    "Woking, UK",
	},
	{
		Title:       "2024 Koenigsegg Jesko Absolut",
		Description: "The fastest Koenigsegg ever conceived. The Jesko Absolut is theoretically capable of 330mph, powered by a 5.0L twin-turbo V8 producing 1,600bhp on E85. Hypercar engineering at its absolute limit.",
		Image:       "/images/6.jpg",
		Reserve:     380000000,
		Location:    "Ängelholm, Sweden",
	},
	{
		Title:       "1970 Porsche 917K",
		Description: "The car that ended Ferrari's dominance at Le Mans. This iconic Gulf-liveried 917K is powered by a 4.9L flat-12 producing 600bhp. Driven by legends, feared by rivals, and immortalised by Steve McQueen.",
		Image:       "/images/7.jpg",
		Reserve:     2800000000,
		Location:    "Stuttgart, Germany",
	},
	{
		Title:       "2024 Lamborghini Temerario",
		Description: "The successor to the Huracán, the Temerario marks a new era for Lamborghini with a twin-turbocharged V8 hybrid system producing 920bhp. Razor-sharp, electrifying, and utterly uncompromising.",
		Image:       "/images/8.jpg",
		Reserve:     42000000,
		Location:    "Sant'Agata Bolognese, Italy",
	},
}

func Reset(db *sql.DB) error {
	if _, err := db.Exec("DELETE FROM items"); err != nil {
		return fmt.Errorf("failed to wipe items: %w", err)
	}
	fmt.Println("Database wiped.")
	return Seed(db)
}

func Seed(db *sql.DB) error {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM items").Scan(&count)
	if err != nil {
		return err
	}
	if count > 0 {
		fmt.Printf("Database already seeded (%d items), skipping.\n", count)
		return nil
	}


	for _, item := range seedItems {
		_, err := db.Exec(
			`INSERT INTO items (id, title, description, image, reserve, current_bid, location) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			uuid.New().String(),
			item.Title,
			item.Description,
			item.Image,
			item.Reserve,
			0,
			item.Location,
		)
		if err != nil {
			return fmt.Errorf("failed to seed item %s: %w", item.Title, err)
		}
	}

	fmt.Println("Database seeded successfully.")
	return nil
}
