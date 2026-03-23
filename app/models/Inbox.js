const db = require('../services/db');

class Inbox {
    static async getUserConversations(userId) {
        // Corrected SQL: Joining LISTING_IMAGES to get the thumbnail
        const sql = `
            SELECT 
                C.conversation_id, 
                C.updated_at,
                L.listing_id, 
                L.title AS item_title,
                IMG.image_url,
                REQ.name AS requester_name, 
                REQ.user_id AS requester_id,
                OWN.name AS owner_name, 
                OWN.user_id AS owner_id
            FROM CONVERSATIONS C
            JOIN LISTINGS L ON C.listing_id = L.listing_id
            -- Join the images table and only take the main photo
            LEFT JOIN LISTING_IMAGES IMG ON L.listing_id = IMG.listing_id AND IMG.is_main = TRUE
            JOIN USERS REQ ON C.requester_id = REQ.user_id
            JOIN USERS OWN ON L.user_id = OWN.user_id
            WHERE C.requester_id = ? OR L.user_id = ?
            ORDER BY C.updated_at DESC
        `;
        
        try {
            return await db.query(sql, [userId, userId]);
        } catch (err) {
            console.error("SQL Error in Inbox Model:", err.message);
            throw err;
        }
    }
}

module.exports = Inbox;