const { validationResult } = require("express-validator");
const Label = require("../models/Label");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const { sendSuccess, sendError } = require("../utils/responseHelper");

const getLabelsByProject = async (req, res, next) => {
  try {
    const labels = await Label.findByProject(req.params.id);
    return sendSuccess(res, labels);
  } catch (err) {
    next(err);
  }
};

const createLabel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { name, color } = req.body;
    const label = await Label.create({ project_id: req.params.id, name, color });
    return sendSuccess(res, label, "Etiket oluşturuldu", 201);
  } catch (err) {
    next(err);
  }
};

const deleteLabel = async (req, res, next) => {
  try {
    await Label.delete(req.params.id);
    return sendSuccess(res, null, "Etiket silindi");
  } catch (err) {
    next(err);
  }
};

const addLabelToTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Görev bulunamadı", 404);

    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) return sendError(res, "Bu projeye erişim yetkiniz yok", 403);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);

    await Label.addToTask(req.params.id, req.body.label_id);
    return sendSuccess(res, null, "Etiket göreve eklendi", 201);
  } catch (err) {
    next(err);
  }
};

const removeLabelFromTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Görev bulunamadı", 404);

    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) return sendError(res, "Bu projeye erişim yetkiniz yok", 403);
    if (!["owner", "contributor"].includes(role))
      return sendError(res, "Bu işlem için yetkiniz yok", 403);

    await Label.removeFromTask(req.params.id, req.params.labelId);
    return sendSuccess(res, null, "Etiket görevden çıkarıldı");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLabelsByProject,
  createLabel,
  deleteLabel,
  addLabelToTask,
  removeLabelFromTask,
};