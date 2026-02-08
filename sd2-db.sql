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
ALTER TABLE ITEMS
    ADD CONSTRAINT items_user_fk
    FOREIGN KEY (user_id)
    REFERENCES USERS (user_id)
    ON DELETE CASCADE;

-- 3. Insert Data (No need to specify ID due to AUTO_INCREMENT)
INSERT INTO USERS (name, email, password_hash) VALUES
('Alice Smith', 'alice@example.com', 'hash123'),
('Bob Johnson', 'bob@example.com', 'hash456');

INSERT INTO ITEMS (title, description, category, status, user_id) VALUES
('Blue Wallet', 'Found near the cafeteria', 'Personal', 'available', 1),
('Car Keys', 'Set of Honda keys', 'Keys', 'available', 2);