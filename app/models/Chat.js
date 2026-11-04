const db = require('../services/db');

class Chat {
    /**
     * Fetches details about the chat room and checks if the user is a participant.
     */
    static async getChatDetails(conversationId, userId) {
        const sql = `
            SELECT C.conversation_id, L.listing_id, L.title AS item_title, 
                   L.user_id AS owner_id, C.requester_id,
                   REQ.name AS requester_name, OWN.name AS owner_name
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

    static async sendMessage(conversationId, senderId, text) {
        // Keep the participant check in the model as well as the HTTP route.
        const participant = await this.getChatDetails(conversationId, senderId);
        if (!participant) throw new Error("Not a participant in this conversation");
        const sql = "INSERT INTO MESSAGES (conversation_id, sender_id, message_text) VALUES (?, ?, ?)";
        return await db.query(sql, [conversationId, senderId, text]);
    }

    static async createConversation(listingId, requesterId) {
        const listing = await db.query(
            "SELECT user_id FROM LISTINGS WHERE listing_id = ? AND status = 'available'",
            [listingId]
        );
        if (!listing || listing.length === 0) throw new Error("Listing is unavailable or does not exist");
        if (String(listing[0].user_id) === String(requesterId)) {
            throw new Error("You cannot start a conversation about your own listing");
        }
        const sql = "INSERT INTO CONVERSATIONS (listing_id, requester_id) VALUES (?, ?)";
        const result = await db.query(sql, [listingId, requesterId]);
        return result.insertId;
    }
}

module.exports = Chat;