const pool = require("../config/database");

const Sprint = {
  async findById(id) {
    const result = await pool.query("SELECT * FROM sprints WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },

  async findByProject(projectId) {
    const result = await pool.query(
      "SELECT * FROM sprints WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId],
    );
    return result.rows;
  },

  async create({ project_id, name, goal, start_date, end_date }) {
    const result = await pool.query(
      `INSERT INTO sprints (project_id, name, goal, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [project_id, name, goal || null, start_date || null, end_date || null],
    );
    return result.rows[0];
  },

  async update(id, { name, goal, start_date, end_date }) {
    const result = await pool.query(
      `UPDATE sprints
       SET name       = COALESCE($1, name),
           goal       = COALESCE($2, goal),
           start_date = COALESCE($3, start_date),
           end_date   = COALESCE($4, end_date)
       WHERE id = $5
       RETURNING *`,
      [name || null, goal || null, start_date || null, end_date || null, id],
    );
    return result.rows[0];
  },

  async start(id) {
    const result = await pool.query(
      "UPDATE sprints SET status = 'active' WHERE id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  },

  async end(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Sprint'i tamamla
      const sprintResult = await client.query(
        "UPDATE sprints SET status = 'completed' WHERE id = $1 RETURNING *",
        [id],
      );

      // Tamamlanmamış görevleri backlog'a al (sprint_id = null)
      await client.query(
        "UPDATE tasks SET sprint_id = NULL WHERE sprint_id = $1 AND status != 'done'",
        [id],
      );

      await client.query("COMMIT");
      return sprintResult.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async addTask(sprintId, taskId) {
    await pool.query("UPDATE tasks SET sprint_id = $1 WHERE id = $2", [
      sprintId,
      taskId,
    ]);
  },

  async removeTask(taskId) {
    await pool.query("UPDATE tasks SET sprint_id = NULL WHERE id = $1", [
      taskId,
    ]);
  },
};

module.exports = Sprint;
