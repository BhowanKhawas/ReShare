const db = require('../services/db');

class Community {
    /**
     * SQL logic to fetch real users and their listing counts.
     * FIX: Uses listing_id to match your database schema.
     */
    static async getAllMembers() {
        const sql = `
            SELECT 
                u.user_id, 
                u.name, 
                COUNT(l.listing_id) AS item_count 
            FROM USERS u
            LEFT JOIN LISTINGS l ON u.user_id = l.user_id
            GROUP BY u.user_id, u.name
            ORDER BY item_count DESC
        `;

        try {
            // MVC: The Model communicates with the Service layer
            const results = await db.query(sql);
            return results;
        } catch (err) {
            console.error("DATABASE FETCH ERROR:", err.message);
            throw err; 
        }
    }
}

module.exports = Community;