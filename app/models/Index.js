const db = require('../services/db');

class Index {
    /**
     * Fetches recent items for the Home Page.
     * Joins with LISTING_IMAGES to ensure photos render on the front page.
     */
    static async getRecentExchanges() {
        const sql = `
            SELECT 
                L.*, 
                I.image_url 
            FROM LISTINGS L
            LEFT JOIN (
                /* Subquery to grab exactly one image per listing */
                SELECT listing_id, MAX(image_url) as image_url 
                FROM LISTING_IMAGES 
                GROUP BY listing_id
            ) I ON L.listing_id = I.listing_id
            ORDER BY L.created_at DESC 
            LIMIT 4
        `;
        
        try {
            const results = await db.query(sql);
            return results;
        } catch (err) {
            console.error("Database Error in Index Model:", err.message);
            throw err;
        }
    }

    // Required placeholder to prevent errors in app.js if it still looks for sales
    static async getRecentSales() {
        return [];
    }
}

module.exports = Index;