const db = require('../services/db');

class Browse {
    static async getAllItems(categoryId = null) {
        // Change C.category_name to C.name since that is your real DB column
        let sql = `
            SELECT L.*, C.name AS category_name 
            FROM LISTINGS L
            JOIN CATEGORIES C ON L.category_id = C.category_id
        `;
        let params = [];

        if (categoryId && categoryId !== 'All') {
            sql += " WHERE L.category_id = ?";
            params.push(categoryId);
        }

        try {
            return await db.query(sql, params);
        } catch (err) {
            console.error("Browse Model Error:", err);
            throw err;
        }
    }
}

module.exports = Browse;