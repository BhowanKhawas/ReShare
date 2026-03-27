const db = require('../services/db');

class User {
    // Empty constructor since profile updates manually set the ID
    constructor() {}
    
    // Update name
    async updateName(newName) {
        if (!this.user_id) throw new Error("User ID is required to update name.");
        const sql = "UPDATE `USERS` SET `name` = ? WHERE `user_id` = ?";
        await db.query(sql, [newName, this.user_id]);
        this.name = newName;
        return true;
    }

    /**
     * STATIC METHOD: getRole
     * Prevents the 'undefined' crash loop.
     */
    static async getRole(userId) {
        if (!userId || userId === 'undefined') {
            return 'guest'; 
        }

        const sql = "SELECT role FROM USERS WHERE user_id = ?";
        try {
            const result = await db.query(sql, [userId]);
            if (result && result.length > 0) {
                return result[0].role; 
            }
            return 'user'; 
        } catch (err) {
            console.error("Database error in User.getRole:", err.message);
            return 'user';
        }
    }

    // ==========================================
    // Fetches profile data for the User View
    // ==========================================
    static async getById(userId) {
        if (!userId) return null; 
        const sql = `
            SELECT u.user_id, u.name, u.email, u.role, u.created_at, u.last_login,
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
            return null; 
        }
    }
}

module.exports = { User };