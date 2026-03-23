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
    role               ENUM('user', 'admin') DEFAULT 'user', -- Added: for administrative control
    items_gifted_count INTEGER DEFAULT 0,
    last_login         TIMESTAMP NULL,                       -- Added: to track user activity
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
    item_condition ENUM('New', 'Like New', 'Good', 'Fair') DEFAULT 'Good', -- Added: condition filter
    status        VARCHAR(50) DEFAULT 'available',
    claimed_at    TIMESTAMP NULL,                        -- Added: to record when swap happened
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (listing_id)
);

CREATE TABLE LISTING_IMAGES (
    image_id   INTEGER NOT NULL AUTO_INCREMENT,
    listing_id INTEGER NOT NULL,
    image_url  VARCHAR(255) NOT NULL,
    is_main    BOOLEAN DEFAULT FALSE,                -- Added: to select the thumbnail image
    PRIMARY KEY (image_id)
);

CREATE TABLE CONVERSATIONS (
    conversation_id INTEGER NOT NULL AUTO_INCREMENT,
    listing_id      INTEGER NOT NULL,
    requester_id    INTEGER NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Added: to sort inbox by newest activity
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id)
);

CREATE TABLE MESSAGES (
    message_id      INTEGER NOT NULL AUTO_INCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id       INTEGER NOT NULL,
    message_text    TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,               -- Added: for "unread message" alerts
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
-- 3. Insert Sample Data (10+ Rows per Table)
-- ==============================================================================

-- Insert 10 Locations
INSERT INTO LOCATIONS (city, region, postal_code, latitude, longitude) VALUES
('London', 'Greater London', 'E1 6AN', 51.5171, -0.0754),
('Manchester', 'Greater Manchester', 'M1 1AD', 53.4808, -2.2426),
('Feltham', 'Greater London', 'TW13 4HU', 51.4496, -0.4089),
('Bristol', 'South West', 'BS1 5TR', 51.4545, -2.5879),
('Birmingham', 'West Midlands', 'B1 1BB', 52.4862, -1.8904),
('Leeds', 'Yorkshire', 'LS1 2DS', 53.7997, -1.5492),
('Glasgow', 'Scotland', 'G2 1AL', 55.8642, -4.2518),
('Sheffield', 'Yorkshire', 'S1 2JA', 53.3811, -1.4701),
('Edinburgh', 'Scotland', 'EH1 1YZ', 55.9533, -3.1883),
('Liverpool', 'North West', 'L1 8JQ', 53.4084, -2.9916);

-- Insert 10 Categories
INSERT INTO CATEGORIES (name) VALUES
('Furniture'),
('Electronics'),
('Books'),
('Clothing'),
('Home & Garden'),
('Toys & Games'),
('Sports Equipment'),
('Musical Instruments'),
('Pet Supplies'),
('Art & Collectibles');

-- Insert 10 Users
INSERT INTO USERS (location_id, name, email, password_hash, items_gifted_count, role) VALUES
(1, 'Sarah Jenkins', 'sarah@example.com', 'hashed_pass_123', 5, 'user'),
(2, 'Dave Smith', 'dave@student.ac.uk', 'hashed_pass_456', 0, 'user'),
(1, 'Emma Watson', 'emma@example.com', 'hashed_pass_789', 2, 'admin'),
(3, 'Ranju Sharma', 'ranju@example.com', 'hashed_pass_101', 8, 'user'),
(4, 'James Holden', 'james@example.com', 'hashed_pass_202', 1, 'user'),
(3, 'Aisha Patel', 'aisha@example.com', 'hashed_pass_303', 12, 'user'),
(5, 'Michael Chang', 'michael@example.com', 'hashed_pass_404', 3, 'user'),
(6, 'Olivia Taylor', 'olivia@example.com', 'hashed_pass_505', 0, 'user'),
(7, 'Liam O Connor', 'liam@example.com', 'hashed_pass_606', 7, 'user'),
(8, 'Sophia Rossi', 'sophia@example.com', 'hashed_pass_707', 4, 'user');

-- Insert 10 Listings
INSERT INTO LISTINGS (user_id, category_id, location_id, claimed_by_id, title, description, item_condition, status) VALUES
(1, 1, 1, NULL, 'Wooden Dining Table', 'Sturdy 4-seater table. A few scratches but great condition.', 'Good', 'available'),
(3, 3, 1, 2, 'Computer Science Textbook', 'Used for Year 1. Free to a good home.', 'Like New', 'completed'),
(4, 1, 3, NULL, 'Office Desk Chair', 'Comfortable office chair in good condition. Has adjustable height.', 'Good', 'available'),
(5, 2, 4, NULL, 'Table Lamp', 'Black metal desk lamp. Works perfectly, bulb included.', 'Like New', 'available'),
(6, 4, 3, NULL, 'Winter Jacket', 'Men''s black winter bomber jacket, size Large. Very warm.', 'Good', 'available'),
(1, 5, 1, NULL, 'Gardening Tools Set', 'Includes a trowel, rake, and gloves. Moving to a flat.', 'Fair', 'available'),
(7, 8, 5, NULL, 'Acoustic Guitar', 'Beginner guitar. Missing one string but otherwise sounds great.', 'Good', 'available'),
(8, 7, 6, NULL, 'Tennis Racket', 'Used for one summer. Grip is still in excellent condition.', 'Like New', 'available'),
(9, 9, 7, NULL, 'Cat Carrier', 'Hard plastic pet carrier. Suitable for cats or small dogs.', 'Good', 'available'),
(10, 10, 8, NULL, 'Vintage Wall Clock', 'Mechanical wind-up clock. Ticks a bit loudly but keeps perfect time.', 'Good', 'available');

-- Insert 10 Images (Using Unsplash placeholders so your grid looks amazing)
INSERT INTO LISTING_IMAGES (listing_id, image_url, is_main) VALUES
(1, 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=600&auto=format&fit=crop', TRUE),
(2, 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop', TRUE),
(3, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=600&auto=format&fit=crop', TRUE), 
(4, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop', TRUE), 
(5, 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=600&auto=format&fit=crop', TRUE), 
(6, 'https://images.unsplash.com/photo-1416879598555-46e3b08e58f0?q=80&w=600&auto=format&fit=crop', TRUE),
(7, 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&auto=format&fit=crop', TRUE),
(8, 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=600&auto=format&fit=crop', TRUE),
(9, 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600&auto=format&fit=crop', TRUE),
(10, 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop', TRUE); 

-- Insert 10 Conversations (Linking different users to different items)
INSERT INTO CONVERSATIONS (listing_id, requester_id) VALUES
(1, 2),  -- Dave asks Sarah about the Table
(3, 1),  -- Sarah asks Ranju about the Chair
(4, 6),  -- Aisha asks James about the Lamp
(5, 2),  -- Dave asks Aisha about the Jacket
(6, 4),  -- Ranju asks Sarah about the Tools
(7, 10), -- Sophia asks Michael about the Guitar
(8, 3),  -- Emma asks Olivia about the Racket
(9, 1),  -- Sarah asks Liam about the Cat Carrier
(10, 5), -- James asks Sophia about the Clock
(1, 4);  -- Ranju ALSO asks Sarah about the Table (multiple people want it!)

-- Insert Messages for those conversations
INSERT INTO MESSAGES (conversation_id, sender_id, message_text, is_read) VALUES
(1, 2, 'Hi Sarah, is this table still available? Can I pick it up tomorrow?', TRUE),
(1, 1, 'Hi Dave, yes it is! Tomorrow at 6 PM works for me.', FALSE),
(2, 1, 'Hi Ranju, I love the desk chair! Are you around this weekend?', FALSE),
(3, 6, 'Hi James, how tall is the lamp?', TRUE),
(3, 5, 'It is about 40cm tall. Still interested?', FALSE),
(4, 2, 'Is the jacket waterproof?', FALSE),
(5, 4, 'I can come grab the tools right now if you are free!', FALSE),
(6, 10, 'Does the guitar come with a case?', TRUE),
(7, 3, 'I would love the racket for my daughter.', FALSE),
(8, 1, 'Hi Liam, will a large tabby cat fit in this?', FALSE),
(9, 5, 'Does the clock need batteries or just winding?', TRUE),
(10, 4, 'Hi Sarah, if Dave falls through, I can take the table!', FALSE);