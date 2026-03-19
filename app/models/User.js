const db = require('../services/db');

class User {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async updateName(newName) {
        const sql = "UPDATE USERS SET name = ? WHERE user_id = ?";
        return await db.query(sql, [newName, this.user_id]);
    }
}

module.exports = User;