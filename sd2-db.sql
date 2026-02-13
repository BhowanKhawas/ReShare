-- Database: sd2-db
volumes:
      - ./sd2-db.sql:/docker-entrypoint-initdb.d/init.sql
-- Drop tables in reverse order of dependency to allow for a clean re-run
DROP TABLE IF EXISTS ITEMS;
DROP TABLE IF EXISTS USERS;

-- 1. Table Definitions
CREATE TABLE USERS (
    user_id       INTEGER NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

CREATE TABLE ITEMS (
    item_id     INTEGER NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    image_path  VARCHAR(255),
    location    VARCHAR(255),
    status      VARCHAR(50) DEFAULT 'available',
    user_id     INTEGER NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id)
);

-- 2. Foreign Keys
-- This links the item to the user who posted it
ALTER TABLE ITEMS
    ADD CONSTRAINT items_user_fk
    FOREIGN KEY (user_id)
    REFERENCES USERS (user_id)
    ON DELETE CASCADE;

-- 3. Insert Sample Data
-- Note: user_id and item_id are handled by AUTO_INCREMENT

INSERT INTO USERS (name, email, password_hash) VALUES
('John Doe', 'john@example.com', 'hashed_pass_123'),
('Jane Smith', 'jane@example.com', 'hashed_pass_456');

INSERT INTO ITEMS (title, description, category, location, user_id) VALUES
('Lost Sunglasses', 'Black Ray-Bans found near the park entrance', 'Accessories', 'Downtown Park', 1),
('Mountain Bike', 'Used blue mountain bike, good condition', 'Sports', 'Eastside', 2),
('Forgotten Umbrella', 'Large golf umbrella left in the lobby', 'Personal', 'Central Office', 1);