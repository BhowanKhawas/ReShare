const db = require('../services/db');

class Listing {
    // MVC static method to handle the database insert
    static async create(data) {
        const sql = "INSERT INTO LISTINGS (title, category, item_condition, description, user_id) VALUES (?, ?, ?, ?, ?)";
        // Using user_id 1 as a placeholder until you have a session/login system
        const params = [data.title, data.category, data.item_condition, data.description, 1];
        return await db.query(sql, params);
    }
}

module.exports = Listing;