const db = require('../services/db');

class Listing {
    // ... your existing methods ...

    static async markAsClaimed(listingId, claimerId) {
        try {
            // 1. Get the owner_id before we update anything
            const ownerQuery = "SELECT user_id FROM LISTINGS WHERE listing_id = ?";
            const result = await db.query(ownerQuery, [listingId]);
            
            if (result.length === 0) throw new Error("Listing not found");
            const ownerId = result[0].user_id;

            // 2. Update the Listing status and claimer
            const updateListingSql = `
                UPDATE LISTINGS 
                SET status = 'completed', 
                    claimed_by_id = ?, 
                    claimed_at = CURRENT_TIMESTAMP 
                WHERE listing_id = ?
            `;
            await db.query(updateListingSql, [claimerId, listingId]);

            // 3. Increment the owner's gifted count
            const updateUserSql = `
                UPDATE USERS 
                SET items_gifted_count = items_gifted_count + 1 
                WHERE user_id = ?
            `;
            await db.query(updateUserSql, [ownerId]);

            return true;
        } catch (err) {
            console.error("Error in markAsClaimed Model:", err);
            throw err;
        }
    }
}

module.exports = Listing;