-- Database: sd2-db
volumes:
      - ./sd2-db.sql:/docker-entrypoint-initdb.d/init.sql



-- ==============================================================================
-- ReShare Database Schema
-- ==============================================================================

-- Drop tables in reverse order of dependency to allow for a clean re-run
DROP TABLE IF EXISTS MESSAGES;
DROP TABLE IF EXISTS CONVERSATIONS;
DROP TABLE IF EXISTS LISTING_IMAGES;
DROP TABLE IF EXISTS LISTINGS;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS CATEGORIES;
DROP TABLE IF EXISTS LOCATIONS;

-- ==============================================================================
-- 1. Table Definitions
-- ==============================================================================

CREATE TABLE LOCATIONS (
    location_id INTEGER NOT NULL AUTO_INCREMENT,
    city        VARCHAR(100) NOT NULL,
    region      VARCHAR(100),
    postal_code VARCHAR(20),
    latitude    DECIMAL(10, 8),
    longitude   DECIMAL(11, 8),
    PRIMARY KEY (location_id)
);

CREATE TABLE CATEGORIES (
    category_id INTEGER NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    PRIMARY KEY (category_id)
);

CREATE TABLE USERS (
    user_id            INTEGER NOT NULL AUTO_INCREMENT,
    location_id        INTEGER,
    name               VARCHAR(100) NOT NULL,
    email              VARCHAR(255) NOT NULL UNIQUE,
    password_hash      VARCHAR(255) NOT NULL,
    profile_image      VARCHAR(255),
    items_gifted_count INTEGER DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

CREATE TABLE LISTINGS (
    listing_id    INTEGER NOT NULL AUTO_INCREMENT,
    user_id       INTEGER NOT NULL,
    category_id   INTEGER NOT NULL,
    location_id   INTEGER NOT NULL,
    claimed_by_id INTEGER DEFAULT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    status        VARCHAR(50) DEFAULT 'available',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (listing_id)
);

CREATE TABLE LISTING_IMAGES (
    image_id   INTEGER NOT NULL AUTO_INCREMENT,
    listing_id INTEGER NOT NULL,
    image_url  VARCHAR(255) NOT NULL,
    PRIMARY KEY (image_id)
);

CREATE TABLE CONVERSATIONS (
    conversation_id INTEGER NOT NULL AUTO_INCREMENT,
    listing_id      INTEGER NOT NULL,
    requester_id    INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id)
);

CREATE TABLE MESSAGES (
    message_id      INTEGER NOT NULL AUTO_INCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id       INTEGER NOT NULL,
    message_text    TEXT NOT NULL,
    sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id)
);

-- ==============================================================================
-- 2. Foreign Keys
-- ==============================================================================

ALTER TABLE USERS
    ADD CONSTRAINT users_location_fk
    FOREIGN KEY (location_id) REFERENCES LOCATIONS (location_id)
    ON DELETE SET NULL;

ALTER TABLE LISTINGS
    ADD CONSTRAINT listings_owner_fk
    FOREIGN KEY (user_id) REFERENCES USERS (user_id)
    ON DELETE CASCADE;

ALTER TABLE LISTINGS
    ADD CONSTRAINT listings_category_fk
    FOREIGN KEY (category_id) REFERENCES CATEGORIES (category_id)
    ON DELETE RESTRICT;

ALTER TABLE LISTINGS
    ADD CONSTRAINT listings_location_fk
    FOREIGN KEY (location_id) REFERENCES LOCATIONS (location_id)
    ON DELETE RESTRICT;

ALTER TABLE LISTINGS
    ADD CONSTRAINT listings_claimer_fk
    FOREIGN KEY (claimed_by_id) REFERENCES USERS (user_id)
    ON DELETE SET NULL;

ALTER TABLE LISTING_IMAGES
    ADD CONSTRAINT images_listing_fk
    FOREIGN KEY (listing_id) REFERENCES LISTINGS (listing_id)
    ON DELETE CASCADE;

ALTER TABLE CONVERSATIONS
    ADD CONSTRAINT convos_listing_fk
    FOREIGN KEY (listing_id) REFERENCES LISTINGS (listing_id)
    ON DELETE CASCADE;

ALTER TABLE CONVERSATIONS
    ADD CONSTRAINT convos_requester_fk
    FOREIGN KEY (requester_id) REFERENCES USERS (user_id)
    ON DELETE CASCADE;

ALTER TABLE MESSAGES
    ADD CONSTRAINT msgs_convo_fk
    FOREIGN KEY (conversation_id) REFERENCES CONVERSATIONS (conversation_id)
    ON DELETE CASCADE;

ALTER TABLE MESSAGES
    ADD CONSTRAINT msgs_sender_fk
    FOREIGN KEY (sender_id) REFERENCES USERS (user_id)
    ON DELETE CASCADE;

-- ==============================================================================
-- 3. Insert Sample Data
-- ==============================================================================

-- Insert Locations
INSERT INTO LOCATIONS (city, region, postal_code, latitude, longitude) VALUES
('London', 'Greater London', 'E1 6AN', 51.5171, -0.0754),
('Manchester', 'Greater Manchester', 'M1 1AD', 53.4808, -2.2426);

-- Insert Categories
INSERT INTO CATEGORIES (name) VALUES
('Furniture'),
('Electronics'),
('Books'),
('Clothing');

-- Insert Users (Passwords are just examples, should be hashed in real app)
INSERT INTO USERS (location_id, name, email, password_hash, items_gifted_count) VALUES
(1, 'Sarah Jenkins', 'sarah@example.com', 'hashed_pass_123', 5),
(2, 'Dave Smith', 'dave@student.ac.uk', 'hashed_pass_456', 0),
(1, 'Emma Watson', 'emma@example.com', 'hashed_pass_789', 2);

-- Insert Listings
-- Listing 1: Available table posted by Sarah
-- Listing 2: Completed textbook posted by Emma, claimed by Dave
INSERT INTO LISTINGS (user_id, category_id, location_id, claimed_by_id, title, description, status) VALUES
(1, 1, 1, NULL, 'Wooden Dining Table', 'Sturdy 4-seater table. A few scratches but great condition.', 'available'),
(3, 3, 1, 2, 'Computer Science Textbook', 'Used for Year 1. Free to a good home.', 'completed');

-- Insert Images for the listings
INSERT INTO LISTING_IMAGES (listing_id, image_url) VALUES
(1, '/uploads/table_front.jpg'),
(1, '/uploads/table_top.jpg'),
(2, '/uploads/book_cover.jpg');

-- Insert a Conversation (Dave asking Sarah about the table)
INSERT INTO CONVERSATIONS (listing_id, requester_id) VALUES
(1, 2);

-- Insert Messages into that conversation
INSERT INTO MESSAGES (conversation_id, sender_id, message_text) VALUES
(1, 2, 'Hi Sarah, is this table still available? Can I pick it up tomorrow?'),
(1, 1, 'Hi Dave, yes it is! Tomorrow at 6 PM works for me.');