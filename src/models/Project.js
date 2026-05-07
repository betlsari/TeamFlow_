const pool = require("../config/database");

const Project = {
  async findById(id) {
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },

  async findByUser(userId) {
    const result = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId],
    );
    return result.rows;
  },

  async create({ title, description, owner_id }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const projectResult = await client.query(
        `INSERT INTO projects (title, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [title, description || null, owner_id],
      );
      const project = projectResult.rows[0];

      // Oluşturan kişiyi otomatik owner olarak ekle
      await client.query(
        "INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')",
        [project.id, owner_id],
      );

      await client.query("COMMIT");
      return project;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async update(id, { title, description, status }) {
    const result = await pool.query(
      `UPDATE projects
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           status      = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [title || null, description || null, status || null, id],
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
  },

  async getStatistics(id) {
    const result = await pool.query(
      `SELECT
         COUNT(*)                                        AS total_tasks,
         COUNT(*) FILTER (WHERE status = 'done')        AS completed_tasks,
         COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_tasks,
         COUNT(*) FILTER (WHERE status = 'todo')        AS todo_tasks
       FROM tasks WHERE project_id = $1`,
      [id],
    );
    return result.rows[0];
  },
};

module.exports = Project;
