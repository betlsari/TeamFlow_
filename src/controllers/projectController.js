const { validationResult } = require("express-validator");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { sendSuccess, sendError } = require("../utils/responseHelper");

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      owner_id: req.user.userId,
    });

    return sendSuccess(res, project, "Proje oluşturuldu", 201);
  } catch (err) {
    next(err);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findByUser(req.user.userId);
    return sendSuccess(res, projects);
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, "Proje bulunamadı", 404);
    return sendSuccess(res, project);
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { title, description, status } = req.body;
    const project = await Project.update(req.params.id, { title, description, status });
    if (!project) return sendError(res, "Proje bulunamadı", 404);

    return sendSuccess(res, project, "Proje güncellendi");
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, "Proje bulunamadı", 404);

    await Project.delete(req.params.id);
    return sendSuccess(res, null, "Proje silindi", 204);
  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await ProjectMember.findAll(req.params.id);
    return sendSuccess(res, members);
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendError(res, "Validasyon hatası", 400, errors.array());

    const { user_id, role = "viewer" } = req.body;
    const projectId = req.params.id;

    const user = await User.findById(user_id);
    if (!user) return sendError(res, "Kullanıcı bulunamadı", 404);

    const member = await ProjectMember.add(projectId, user_id, role);

    await ActivityLog.log({
      project_id: projectId,
      user_id: req.user.userId,
      action: "member_added",
      entity_type: "user",
      entity_id: user_id,
    });

    return sendSuccess(res, member, "Üye eklendi", 201);
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return sendError(res, "Proje bulunamadı", 404);

    if (project.owner_id === userId)
      return sendError(res, "Proje sahibi projeden çıkarılamaz", 400);

    const isMember = await ProjectMember.isMember(projectId, userId);
    if (!isMember) return sendError(res, "Kullanıcı bu projenin üyesi değil", 404);

    await ProjectMember.remove(projectId, userId);

    await ActivityLog.log({
      project_id: projectId,
      user_id: req.user.userId,
      action: "member_removed",
      entity_type: "user",
      entity_id: userId,
    });

    return sendSuccess(res, null, "Üye çıkarıldı");
  } catch (err) {
    next(err);
  }
};

const getStatistics = async (req, res, next) => {
  try {
    const stats = await Project.getStatistics(req.params.id);
    return sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

const getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = await ActivityLog.findByProject(req.params.id, limit);
    return sendSuccess(res, activities);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getMembers,
  addMember,
  removeMember,
  getStatistics,
  getActivities,
};