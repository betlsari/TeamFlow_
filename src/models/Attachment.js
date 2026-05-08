const pool = require("../config/database");

const Attachment = {
  async findByTask(taskId) {
    const result = await pool.query(
      `SELECT a.*, u.username, u.full_name
       FROM attachments a
       JOIN users u ON u.id = a.uploaded_by
       WHERE a.task_id = $1
       ORDER BY a.created_at DESC`,
      [taskId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM attachments WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ task_id, file_url, file_name, uploaded_by }) {
    const result = await pool.query(
      `INSERT INTO attachments (task_id, file_url, file_name, uploaded_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [task_id, file_url, file_name, uploaded_by]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM attachments WHERE id = $1", [id]);
  },
};

module.exports = Attachment;