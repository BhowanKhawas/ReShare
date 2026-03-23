const db = require('../services/db');

class Category {
    static async getCategoryCounts() {
        const sql = `
            SELECT 
                C.category_id, 
                C.name AS category_name, 
                COUNT(L.listing_id) AS item_count 
            FROM CATEGORIES C
            LEFT JOIN LISTINGS L ON C.category_id = L.category_id
            GROUP BY C.category_id, C.name
            ORDER BY C.name ASC
        `;
        
        try {
            const results = await db.query(sql);
            return results;
        } catch (err) {
            console.error("SQL Error in Category Model:", err.message);
            throw err;
        }
    }
}

module.exports = Category;