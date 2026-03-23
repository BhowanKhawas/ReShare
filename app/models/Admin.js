const db = require('../services/db');

class Admin {
    // Delete any listing and its associated images
    static async deleteListing(listingId) {
        const sql = "DELETE FROM LISTINGS WHERE listing_id = ?";
        return await db.query(sql, [listingId]);
    }

    // Rewrite any listing content
    static async updateListing(listingId, data) {
        const sql = `
            UPDATE LISTINGS 
            SET title = ?, description = ?, item_condition = ?, category_id = ? 
            WHERE listing_id = ?
        `;
        return await db.query(sql, [data.title, data.description, data.condition, data.category, listingId]);
    }

    // Get all users to manage the community
    static async getAllUsers() {
        return await db.query("SELECT * FROM USERS ORDER BY created_at DESC");
    }
}

module.exports = Admin;