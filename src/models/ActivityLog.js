const pool = require("../config/database");

/**
 * Geçerli action değerleri:
 * task_created, task_updated, task_status_changed, task_deleted
 * member_added, member_removed
 * sprint_started, sprint_ended
 * comment_added
 */
const ActivityLog = {
  async log({ project_id, user_id, action, entity_type, entity_id }) {
    await pool.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [project_id, user_id, action, entity_type, entity_id || null],
    );
  },

  async findByProject(projectId, limit = 50) {
    const result = await pool.query(
      `SELECT al.*, u.username, u.full_name
       FROM activity_logs al
       JOIN users u ON u.id = al.user_id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [projectId, limit],
    );
    return result.rows;
  },
};

module.exports = ActivityLog;
