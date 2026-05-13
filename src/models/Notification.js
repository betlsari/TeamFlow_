const pool = require("../config/database");

const Notification = {
    async findByUser(userId, { limit = 20, onlyUnread = false } = {}) {
        const condition = onlyUnread
            ? "WHERE user_id = $1 AND is_read = false"
            : "WHERE user_id = $1";

        const result = await pool.query(
            `SELECT * FROM notifications
       ${condition}
       ORDER BY created_at DESC
       LIMIT $2`,
            [userId, limit],
        );
        return result.rows;
    },

    async create({ user_id, content, link }) {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, content, link)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [user_id, content, link || null],
        );
        return result.rows[0];
    },

    async markAsRead(id, userId) {
        const result = await pool.query(
            `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [id, userId],
        );
        return result.rows[0] || null;
    },

    async markAllAsRead(userId) {
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1",
            [userId],
        );
    },

    async delete(id, userId) {
        await pool.query(
            "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
            [id, userId],
        );
    },

    async unreadCount(userId) {
        const result = await pool.query(
            "SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false",
            [userId],
        );
        return parseInt(result.rows[0].count, 10);
    },
};

module.exports = Notification;