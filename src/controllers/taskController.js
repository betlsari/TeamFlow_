const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const ActivityLog = require("../models/ActivityLog");
const { sendSuccess, sendError } = require("../utils/responseHelper");

const checkProjectAccess = async (task, userId, allowedRoles) => {
  if (!task) return { error: "Görev bulunamadı", status: 404 };
  const role = await ProjectMember.findRole(task.project_id, userId);
  if (!role) return { error: "Bu projeye erişim yetkiniz yok", status: 403 };
  if (allowedRoles && !allowedRoles.includes(role))
    return { error: "Bu işlem için yetkiniz yok", status: 403 };
  return { role };
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { title, description, status, priority, due_date, sprint_id } = req.body;
    const project_id = req.params.id;

    const task = await Task.create({
      project_id,
      sprint_id,
      title,
      description,
      status,
      priority,
      due_date,
      created_by: req.user.userId,
    });

    await ActivityLog.log({
      project_id,
      user_id: req.user.userId,
      action: "task_created",
      entity_type: "task",
      entity_id: task.id,
    });

    return sendSuccess(res, task, "Görev oluşturuldu", 201);
  } catch (err) {
    next(err);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const { status, sprint_id, assignee_id } = req.query;
    const tasks = await Task.findByProject(req.params.id, {
      status,
      sprint_id,
      assignee_id,
    });
    return sendSuccess(res, tasks);
  } catch (err) {
    next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(task, req.user.userId, null);
    if (error) return sendError(res, error, status);
    return sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(
      task, req.user.userId, ["owner", "contributor"]
    );
    if (error) return sendError(res, error, status);

    const updated = await Task.update(req.params.id, req.body);
    return sendSuccess(res, updated, "Görev güncellendi");
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(
      task, req.user.userId, ["owner", "contributor"]
    );
    if (error) return sendError(res, error, status);

    await Task.delete(req.params.id);

    await ActivityLog.log({
      project_id: task.project_id,
      user_id: req.user.userId,
      action: "task_deleted",
      entity_type: "task",
      entity_id: task.id,
    });

    return sendSuccess(res, null, "Görev silindi", 204);
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(
      task, req.user.userId, ["owner", "contributor"]
    );
    if (error) return sendError(res, error, status);

    const updated = await Task.updateStatus(req.params.id, req.body.status);

    await ActivityLog.log({
      project_id: task.project_id,
      user_id: req.user.userId,
      action: "task_status_changed",
      entity_type: "task",
      entity_id: task.id,
    });

    return sendSuccess(res, updated, "Görev durumu güncellendi");
  } catch (err) {
    next(err);
  }
};

const getAssignees = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(task, req.user.userId, null);
    if (error) return sendError(res, error, status);

    const assignees = await Task.getAssignees(req.params.id);
    return sendSuccess(res, assignees);
  } catch (err) {
    next(err);
  }
};

const addAssignee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(
      task, req.user.userId, ["owner", "contributor"]
    );
    if (error) return sendError(res, error, status);

    const { user_id } = req.body;
    const isMember = await ProjectMember.isMember(task.project_id, user_id);
    if (!isMember)
      return sendError(res, "Kullanıcı bu projenin üyesi değil", 400);

    await Task.addAssignee(req.params.id, user_id);
    return sendSuccess(res, null, "Atama yapıldı", 201);
  } catch (err) {
    next(err);
  }
};

const removeAssignee = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const { error, status } = await checkProjectAccess(
      task, req.user.userId, ["owner", "contributor"]
    );
    if (error) return sendError(res, error, status);

    await Task.removeAssignee(req.params.id, req.params.userId);
    return sendSuccess(res, null, "Atama kaldırıldı");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getAssignees,
  addAssignee,
  removeAssignee,
};