const db = require('../services/db');

class ItemDetail {
    /**
     * Fetches complete details for a single item.
     * Joins Listings with Images, Users, Categories, and Locations.
     */
    static async getFullInfo(itemId) {
        const sql = `
            SELECT 
                L.listing_id, 
                L.title, 
                L.description, 
                L.item_condition, 
                L.status,
                L.created_at,
                L.user_id,
                I.image_url, 
                U.name AS owner_name, 
                C.name AS category_name,
                LOC.city AS location_name
            FROM LISTINGS L
            LEFT JOIN LISTING_IMAGES I ON L.listing_id = I.listing_id
            LEFT JOIN USERS U ON L.user_id = U.user_id
            LEFT JOIN CATEGORIES C ON L.category_id = C.category_id
            LEFT JOIN LOCATIONS LOC ON L.location_id = LOC.location_id
            WHERE L.listing_id = ?
            LIMIT 1
        `;
        try {
            const rows = await db.query(sql, [itemId]);
            // Return the first matching item or null if not found
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error("❌ Model Error in ItemDetail.getFullInfo: ", err.message);
            throw err;

        }

    }

}

module.exports = ItemDetail;