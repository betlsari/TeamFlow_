const { validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const ActivityLog = require("../models/ActivityLog");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// GET /api/tasks/:id/comments
const getComments = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Görev bulunamadı", 404);

    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) return sendError(res, "Bu projeye erişim yetkiniz yok", 403);

    const comments = await Comment.findByTask(req.params.id);
    return sendSuccess(res, comments);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/comments
const createComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Görev bulunamadı", 404);

    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) return sendError(res, "Bu projeye erişim yetkiniz yok", 403);

    const { content, parent_id } = req.body;
    const comment = await Comment.create({
      task_id: req.params.id,
      user_id: req.user.userId,
      content,
      parent_id,
    });

    await ActivityLog.log({
      project_id: task.project_id,
      user_id: req.user.userId,
      action: "comment_added",
      entity_type: "comment",
      entity_id: comment.id,
    });

    return sendSuccess(res, comment, "Yorum eklendi", 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/comments/:id
const updateComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, "Yorum bulunamadı", 404);
    if (comment.user_id !== req.user.userId)
      return sendError(res, "Sadece kendi yorumunuzu güncelleyebilirsiniz", 403);

    const updated = await Comment.update(req.params.id, req.body.content);
    return sendSuccess(res, updated, "Yorum güncellendi");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return sendError(res, "Yorum bulunamadı", 404);

    const task = await Task.findById(comment.task_id);
    const role = await ProjectMember.findRole(task.project_id, req.user.userId);

    const isAuthor = comment.user_id === req.user.userId;
    const isOwner = role === "owner";

    if (!isAuthor && !isOwner)
      return sendError(res, "Bu yorumu silme yetkiniz yok", 403);

    await Comment.delete(req.params.id);
    return sendSuccess(res, null, "Yorum silindi");
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };