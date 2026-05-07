const pool = require("../config/database");

const ProjectMember = {
  async findRole(projectId, userId) {
    const result = await pool.query(
      "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );
    return result.rows[0]?.role || null;
  },

  async findAll(projectId) {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url, pm.role, pm.joined_at
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [projectId],
    );
    return result.rows;
  },

  async add(projectId, userId, role = "viewer") {
    const result = await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [projectId, userId, role],
    );
    return result.rows[0];
  },

  async remove(projectId, userId) {
    await pool.query(
      "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );
  },

  async isMember(projectId, userId) {
    const result = await pool.query(
      "SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2",
      [projectId, userId],
    );
    return result.rows.length > 0;
  },
};

module.exports = ProjectMember;
