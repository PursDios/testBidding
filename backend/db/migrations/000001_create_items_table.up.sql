CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    reserve INTEGER NOT NULL,
    current_bid INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL
);
