const pool = require("../config/database");

const Task = {
  async findById(id) {
    const result = await pool.query(
      `SELECT t.*,
              json_agg(DISTINCT jsonb_build_object('id', u.id, 'username', u.username, 'full_name', u.full_name))
                FILTER (WHERE u.id IS NOT NULL) AS assignees,
              json_agg(DISTINCT jsonb_build_object('id', l.id, 'name', l.name, 'color', l.color))
                FILTER (WHERE l.id IS NOT NULL) AS labels
       FROM tasks t
       LEFT JOIN task_assignees ta ON ta.task_id = t.id
       LEFT JOIN users u ON u.id = ta.user_id
       LEFT JOIN task_labels tl ON tl.task_id = t.id
       LEFT JOIN labels l ON l.id = tl.label_id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findByProject(projectId, filters = {}) {
    const conditions = ["t.project_id = $1"];
    const values = [projectId];
    let idx = 2;

    if (filters.status) {
      conditions.push(`t.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.sprint_id) {
      conditions.push(`t.sprint_id = $${idx++}`);
      values.push(filters.sprint_id);
    }
    if (filters.assignee_id) {
      conditions.push(
        `EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = $${idx++})`,
      );
      values.push(filters.assignee_id);
    }

    const result = await pool.query(
      `SELECT t.* FROM tasks t
       WHERE ${conditions.join(" AND ")}
       ORDER BY t.created_at DESC`,
      values,
    );
    return result.rows;
  },

  async create({
    project_id,
    sprint_id,
    title,
    description,
    status,
    priority,
    due_date,
    created_by,
  }) {
    const result = await pool.query(
      `INSERT INTO tasks (project_id, sprint_id, title, description, status, priority, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        project_id,
        sprint_id || null,
        title,
        description || null,
        status || "todo",
        priority || "medium",
        due_date || null,
        created_by,
      ],
    );
    return result.rows[0];
  },

  async update(id, fields) {
    const allowed = [
      "title",
      "description",
      "status",
      "priority",
      "due_date",
      "sprint_id",
    ];
    const updates = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx++}`);
        values.push(fields[key]);
      }
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      "UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  },

  async addAssignee(taskId, userId) {
    await pool.query(
      "INSERT INTO task_assignees (task_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [taskId, userId],
    );
  },

  async removeAssignee(taskId, userId) {
    await pool.query(
      "DELETE FROM task_assignees WHERE task_id = $1 AND user_id = $2",
      [taskId, userId],
    );
  },

  async getAssignees(taskId) {
    const result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM task_assignees ta JOIN users u ON u.id = ta.user_id
       WHERE ta.task_id = $1`,
      [taskId],
    );
    return result.rows;
  },
};

module.exports = Task;
