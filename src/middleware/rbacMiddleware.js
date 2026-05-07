const pool = require("../config/database");
const { sendError } = require("../utils/responseHelper");

const rbac = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;
      const userId = req.user.userId;

      const result = await pool.query(
        "SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2",
        [projectId, userId],
      );

      if (result.rows.length === 0) {
        return sendError(res, "Bu projeye erişim yetkiniz yok", 403);
      }

      const userRole = result.rows[0].role;

      if (!allowedRoles.includes(userRole)) {
        return sendError(res, "Bu işlem için yetkiniz yok", 403);
      }

      req.userRole = userRole;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = rbac;
