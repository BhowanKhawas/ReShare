const db = require('../services/db');

class Index {
    /**
     * Fetches recent items for the Home Page.
     * CRITICAL: 'static' allows app.js to call this without creating a 'new' Index()
     */
    static async getRecentExchanges() {
        // NOTE: I removed the "category" filter because your logs showed 
        // that your database column might be named differently.
        const sql = "SELECT * FROM LISTINGS ORDER BY created_at DESC LIMIT 4";
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

// THIS MUST BE AT THE BOTTOM
module.exports = Index;