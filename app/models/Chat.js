const db = require('../services/db');

class Chat {
    /**
     * 1. Get room details and verify access
     */
    static async getChatDetails(conversationId, userId) {
        const sql = `
            SELECT 
                C.conversation_id, 
                L.listing_id,
                L.title AS item_title, 
                L.user_id AS owner_id, 
                C.requester_id,
                REQ.name AS requester_name,
                OWN.name AS owner_name
            FROM CONVERSATIONS C
            JOIN LISTINGS L ON C.listing_id = L.listing_id
            JOIN USERS REQ ON C.requester_id = REQ.user_id
            JOIN USERS OWN ON L.user_id = OWN.user_id
            WHERE C.conversation_id = ? 
            AND (C.requester_id = ? OR L.user_id = ?)
        `;
        const results = await db.query(sql, [conversationId, userId, userId]);
        return results[0];
    }

    /**
     * 2. Fetch all messages
     */
    static async getMessages(conversationId) {
        const sql = `
            SELECT M.*, U.name AS sender_name 
            FROM MESSAGES M
            JOIN USERS U ON M.sender_id = U.user_id
            WHERE M.conversation_id = ?
            ORDER BY M.sent_at ASC
        `;
        return await db.query(sql, [conversationId]);
    }

    /**
     * 3. Send a new message
     */
    static async sendMessage(conversationId, senderId, text) {
        const sql = "INSERT INTO MESSAGES (conversation_id, sender_id, message_text) VALUES (?, ?, ?)";
        await db.query(sql, [conversationId, senderId, text]);
    }

    /**
     * 4. Create conversation (Fixes the other error you saw)
     */
    static async createConversation(listingId, requesterId) {
        const sql = "INSERT INTO CONVERSATIONS (listing_id, requester_id) VALUES (?, ?)";
        const result = await db.query(sql, [listingId, requesterId]);
        return result.insertId;
    }
}

// CRITICAL: Ensure this is the ONLY export line at the bottom
module.exports = Chat;