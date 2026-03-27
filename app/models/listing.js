const db = require('../services/db');

class Listing {
    // 1. Create a new listing (Uses BOTH tables now!)
    static async create(data, userId) {
            // Step A: Save the main item details to LISTINGS
            const sql = `
                INSERT INTO LISTINGS (title, description, category_id, item_condition, user_id, location_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'available')
            `;
            // FIX: Added fallbacks (||) so these are NEVER undefined
            const paramsListing = [
                data.title || "Untitled Item", 
                data.description || "No description provided", 
                data.category_id || 1, 
                data.condition || "Good", // If 'condition' is missing, it uses 'Good'
                userId,
                data.location_id || 1
            ];

            
            try {
                const result = await db.query(sql, paramsListing);
                const newListingId = result.insertId;

                // Step B: Save to LISTING_IMAGES
                const sqlImage = `
                    INSERT INTO LISTING_IMAGES (listing_id, image_url)
                    VALUES (?, ?)
                `;
                // FIX: Ensure image_url is not undefined
                const imageUrl = data.image_url || '/images/default.jpg';
                
                await db.query(sqlImage, [newListingId, imageUrl]);

                return newListingId;
            } catch (err) {
                console.error("Listing Model Create Error:", err);
                throw err;
            }
        }
    // 2. Existing markAsClaimed method
    static async markAsClaimed(listingId, claimerId) {
        try {
            const ownerQuery = "SELECT user_id FROM LISTINGS WHERE listing_id = ?";
            const result = await db.query(ownerQuery, [listingId]);
            
            if (result.length === 0) throw new Error("Listing not found");
            const ownerId = result[0].user_id;

            const updateListingSql = `
                UPDATE LISTINGS 
                SET status = 'completed', 
                    claimed_by_id = ?, 
                    claimed_at = CURRENT_TIMESTAMP 
                WHERE listing_id = ?
            `;
            await db.query(updateListingSql, [claimerId, listingId]);

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
    // ==========================================
    // USER PROFILE ITEMS (Updated to join your image table)
    // ==========================================
    static async getByUserId(userId) {
        // We must JOIN the tables to get the image since it's not in LISTINGS anymore
        const sql = `
            SELECT L.listing_id, L.title, L.status, I.image_url
            FROM LISTINGS L
            LEFT JOIN LISTING_IMAGES I ON L.listing_id = I.listing_id
            WHERE L.user_id = ? 
            ORDER BY L.listing_id DESC
        `;
        try {
            const results = await db.query(sql, [userId]);
            return results;
        } catch (err) {
            console.error("Error in Listing.getByUserId:", err);
            return []; 
        }
    }
}

module.exports = Listing;