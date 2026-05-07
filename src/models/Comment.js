const pool = require("../config/database");

const Comment = {
  async findById(id) {
    const result = await pool.query("SELECT * FROM comments WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },

  async findByTask(taskId) {
    // Tüm yorumları çek, frontend'de tree yapısına dönüştürülür
    const result = await pool.query(
      `SELECT c.*, u.username, u.full_name, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = $1
       ORDER BY c.created_at ASC`,
      [taskId],
    );

    // Düz listeyi nested tree'ye çevir
    const map = {};
    const roots = [];
    result.rows.forEach((row) => {
      map[row.id] = { ...row, replies: [] };
    });
    result.rows.forEach((row) => {
      if (row.parent_id && map[row.parent_id]) {
        map[row.parent_id].replies.push(map[row.id]);
      } else {
        roots.push(map[row.id]);
      }
    });
    return roots;
  },

  async create({ task_id, user_id, content, parent_id }) {
    const result = await pool.query(
      `INSERT INTO comments (task_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [task_id, user_id, content, parent_id || null],
    );
    return result.rows[0];
  },

  async update(id, content) {
    const result = await pool.query(
      "UPDATE comments SET content = $1 WHERE id = $2 RETURNING *",
      [content, id],
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM comments WHERE id = $1", [id]);
  },
};

module.exports = Comment;
