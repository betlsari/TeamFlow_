const { validationResult } = require("express-validator");
const Sprint = require("../models/Sprint");
const ProjectMember = require("../models/ProjectMember");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// Yardımcı: sprint'in projesinde kullanıcının rolünü bul
const getSprintRole = async (sprintId, userId) => {
  const sprint = await Sprint.findById(sprintId);
  if (!sprint) return { error: "Sprint bulunamadı", status: 404 };
  const role = await ProjectMember.findRole(sprint.project_id, userId);
  if (!role) return { error: "Bu projeye erişim yetkiniz yok", status: 403 };
  return { sprint, role };
};

// GET /api/sprints/:id
const getSprint = async (req, res, next) => {
  try {
    const { sprint, error, status } = await getSprintRole(req.params.id, req.user.userId);
    if (error) return sendError(res, error, status);
    return sendSuccess(res, sprint);
  } catch (err) {
    next(err);
  }
};

// PUT /api/sprints/:id
const updateSprint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { sprint, role, error, status } = await getSprintRole(req.params.id, req.user.userId);
    if (error) return sendError(res, error, status);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);

    const { name, goal, start_date, end_date } = req.body;
    const updated = await Sprint.update(req.params.id, { name, goal, start_date, end_date });
    return sendSuccess(res, updated, "Sprint güncellendi");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/sprints/:id/start
const startSprint = async (req, res, next) => {
  try {
    const { sprint, role, error, status } = await getSprintRole(req.params.id, req.user.userId);
    if (error) return sendError(res, error, status);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);
    if (sprint.status !== "planning")
      return sendError(res, "Sadece planning durumundaki sprint başlatılabilir", 400);

    const updated = await Sprint.start(req.params.id);

    await ActivityLog.log({
      project_id: sprint.project_id,
      user_id: req.user.userId,
      action: "sprint_started",
      entity_type: "sprint",
      entity_id: sprint.id,
    });

    return sendSuccess(res, updated, "Sprint başlatıldı");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/sprints/:id/end
const endSprint = async (req, res, next) => {
  try {
    const { sprint, role, error, status } = await getSprintRole(req.params.id, req.user.userId);
    if (error) return sendError(res, error, status);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);
    if (sprint.status !== "active")
      return sendError(res, "Sadece aktif sprint bitirilebilir", 400);

    const updated = await Sprint.end(req.params.id);

    await ActivityLog.log({
      project_id: sprint.project_id,
      user_id: req.user.userId,
      action: "sprint_ended",
      entity_type: "sprint",
      entity_id: sprint.id,
    });

    return sendSuccess(res, updated, "Sprint tamamlandı, bekleyen görevler backlog'a alındı");
  } catch (err) {
    next(err);
  }
};

// POST /api/sprints/:id/tasks/:taskId
const addTaskToSprint = async (req, res, next) => {
  try {
    const { sprint, role, error, status } = await getSprintRole(req.params.id, req.user.userId);
    if (error) return sendError(res, error, status);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);

    const task = await Task.findById(req.params.taskId);
    if (!task) return sendError(res, "Görev bulunamadı", 404);
    if (task.project_id !== sprint.project_id)
      return sendError(res, "Görev bu projeye ait değil", 400);

    await Sprint.addTask(req.params.id, req.params.taskId);
    return sendSuccess(res, null, "Görev sprint'e eklendi");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sprints/:id/tasks/:taskId
const removeTaskFromSprint = async (req, res, next) => {
  try {
    const { role, error, status } = await getSprintRole(req.params.id, req.user.userId);
    if (error) return sendError(res, error, status);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);

    await Sprint.removeTask(req.params.taskId);
    return sendSuccess(res, null, "Görev sprint'ten çıkarıldı");
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/sprints  (projectRoutes'tan çağrılır)
const createSprint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { name, goal, start_date, end_date } = req.body;
    const sprint = await Sprint.create({
      project_id: req.params.id,
      name,
      goal,
      start_date,
      end_date,
    });

    return sendSuccess(res, sprint, "Sprint oluşturuldu", 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id/sprints  (projectRoutes'tan çağrılır)
const getSprintsByProject = async (req, res, next) => {
  try {
    const sprints = await Sprint.findByProject(req.params.id);
    return sendSuccess(res, sprints);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSprint,
  updateSprint,
  startSprint,
  endSprint,
  addTaskToSprint,
  removeTaskFromSprint,
  createSprint,
  getSprintsByProject,
};