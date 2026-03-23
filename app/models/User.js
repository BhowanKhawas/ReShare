const db = require('../services/db');
const bcrypt = require("bcryptjs");

class User {
    // 1. Constructor updated to accept name and location_id
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

    // 2. Updated to insert the location_id directly from the combobox
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

    // 3. Authenticates a user during login
    async authenticate(submitted) {
        const sql = "SELECT password_hash FROM `USERS` WHERE `user_id` = ?";
        const result = await db.query(sql, [this.user_id || null]);
        
        if (!result || result.length === 0) return false;

        return await bcrypt.compare(submitted, result[0].password_hash);
    }

    // 4. Update name
    async updateName(newName) {
        if (!this.user_id) throw new Error("User ID is required to update name.");
        const sql = "UPDATE `USERS` SET `name` = ? WHERE `user_id` = ?";
        await db.query(sql, [newName, this.user_id]);
        this.name = newName;
        return true;
    }

    /**
     * STATIC METHOD: getRole
     * This is Step 3: Preventing the 'undefined' crash loop.
     */
    static async getRole(userId) {
        // 1. THE GUARD: If userId is empty, null, or undefined, 
        // return 'guest' immediately without touching the database.
        if (!userId || userId === 'undefined') {
            return 'guest'; 
        }

        const sql = "SELECT role FROM USERS WHERE user_id = ?";
        try {
            // 2. THE QUERY: Now it's safe to run because we know userId has a value.
            const result = await db.query(sql, [userId]);
            
            // 3. THE FALLBACK: If user ID doesn't exist in the table, default to 'user'.
            if (result && result.length > 0) {
                return result[0].role; 
            }
            return 'user'; 
        } catch (err) {
            // 4. THE SAFETY: Catch database errors so they don't kill the server process.
            console.error("Database error in User.getRole:", err.message);
            return 'user';
        }
    }
    // ==========================================
    // NEW METHOD: Fetches profile data for the User View
    // FIX: Added a check for !userId to prevent the "undefined" crash
    // ==========================================
    static async getById(userId) {
        if (!userId) return null; // Safety check
        const sql = `
            SELECT u.user_id, u.name, u.email, u.role, 
                   (SELECT COUNT(*) FROM LISTINGS WHERE user_id = u.user_id) as items_gifted_count
            FROM USERS u
            WHERE u.user_id = ?
        `;
        try {
            const result = await db.query(sql, [userId]);
            if (result && result.length > 0) {
                return result[0];
            }
            return null;
        } catch (err) {
            console.error("Error in User.getById:", err);
            return null; // Don't throw, just return null so app stays up
        }
    }
}

module.exports = { User };