const db = require('../services/db');

class Browse {
    static async getAllItems(categoryId = null) {
        // We add LEFT JOIN LISTING_IMAGES to get the photo URL
        let sql = `
            SELECT 
                L.*, 
                C.name AS category_name,
                I.image_url 
            FROM LISTINGS L
            JOIN CATEGORIES C ON L.category_id = C.category_id
            LEFT JOIN (
                /* This subquery ensures we only get ONE image per listing */
                SELECT listing_id, MAX(image_url) as image_url 
                FROM LISTING_IMAGES 
                GROUP BY listing_id
            ) I ON L.listing_id = I.listing_id
        `;
        let params = [];

        if (categoryId && categoryId !== 'All') {
            sql += " WHERE L.category_id = ?";
            params.push(categoryId);
        }

        try {
            // Added debugging to see if image_url is actually coming back
            const results = await db.query(sql, params);
            return results;
        } catch (err) {
            console.error("Browse Model Error:", err);
            throw err;
        }
    }
}

module.exports = Browse;