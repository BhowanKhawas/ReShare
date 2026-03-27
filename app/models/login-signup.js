const db = require('../services/db');
const bcrypt = require("bcryptjs");

class Auth {
    // Initializes the data needed for signup or login
    constructor(email, name = null, location_id = null) {
        this.email = email;
        this.name = name;
        this.location_id = location_id;
    }
    
    // Checks if email exists in the USERS table
    async getIdFromEmail() {
        const sql = "SELECT user_id, role FROM `USERS` WHERE email = ?";
        const result = await db.query(sql, [this.email || null]);
        
        if (result && result.length > 0) {
            this.user_id = result[0].user_id;
            this.role = result[0].role;
            return this.user_id;
        }
        return false;
    }

    // Hashes and updates password for an existing record
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        const sql = "UPDATE `USERS` SET `password_hash` = ? WHERE `user_id` = ?";
        return await db.query(sql, [pw, this.user_id || null]);
    }

    // Inserts a brand new user into the database
    async addUser(password) {
        const pw = await bcrypt.hash(password, 10);

        if (!this.name || !this.email || !this.location_id) {
            throw new Error("Missing required signup fields");
        }

        const sql = `
            INSERT INTO USERS (name, email, password_hash, location_id)
            VALUES (?, ?, ?, ?);
        `;

        const result = await db.query(sql, [
            this.name,
            this.email,
            pw,
            this.location_id
        ]);

        this.user_id = result.insertId;
        return true;
    }

    // Authenticates a user during login
    async authenticate(submitted) {
        const sql = "SELECT password_hash FROM `USERS` WHERE `user_id` = ?";
        const result = await db.query(sql, [this.user_id || null]);
        
        if (!result || result.length === 0) return false;

        return await bcrypt.compare(submitted, result[0].password_hash);
    }
}

// Export the Auth class so app.js can use it
module.exports = { Auth };