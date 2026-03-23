const db = require('../services/db');

class ItemDetail {
    static async getFullInfo(itemId) {
        // The CORRECT SQL query based on your schema
    const sql = `
        SELECT 
            L.listing_id, L.title, L.description, L.item_condition, L.created_at,
            C.name AS category_name,
            LOC.city AS location_name,
            U.name AS owner_name, U.user_id,
            IMG.image_url
        FROM LISTINGS L
        JOIN CATEGORIES C ON L.category_id = C.category_id
        JOIN LOCATIONS LOC ON L.location_id = LOC.location_id
        JOIN USERS U ON L.user_id = U.user_id
        LEFT JOIN LISTING_IMAGES IMG ON L.listing_id = IMG.listing_id AND IMG.is_main = TRUE
        WHERE L.listing_id = ?
    `;
    
        try {
            const results = await db.query(sql, [itemId]);
            return results.length > 0 ? results[0] : null;
        } catch (err) {
            console.error("Database Error in ItemDetail Model:", err.message);
            throw err;
        }
    }
}

module.exports = ItemDetail;