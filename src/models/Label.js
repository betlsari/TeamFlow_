const pool = require("../config/database");

const Label = {
  async findByProject(projectId) {
    const result = await pool.query(
      "SELECT * FROM labels WHERE project_id = $1 ORDER BY name ASC",
      [projectId],
    );
    return result.rows;
  },

  async create({ project_id, name, color }) {
    const result = await pool.query(
      "INSERT INTO labels (project_id, name, color) VALUES ($1, $2, $3) RETURNING *",
      [project_id, name, color || "#6B7280"],
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM labels WHERE id = $1", [id]);
  },

  async addToTask(taskId, labelId) {
    await pool.query(
      "INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [taskId, labelId],
    );
  },

  async removeFromTask(taskId, labelId) {
    await pool.query(
      "DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2",
      [taskId, labelId],
    );
  },
};

module.exports = Label;
