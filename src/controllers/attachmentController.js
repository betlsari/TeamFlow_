const path = require("path");
const fs = require("fs");
const Attachment = require("../models/Attachment");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// GET /api/tasks/:id/attachments
const getAttachments = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, "Görev bulunamadı", 404);

    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) return sendError(res, "Bu projeye erişim yetkiniz yok", 403);

    const attachments = await Attachment.findByTask(req.params.id);
    return sendSuccess(res, attachments);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/attachments
const uploadAttachment = async (req, res, next) => {
  try {
    // Multer hatası varsa yakala
    if (!req.file) {
      return sendError(res, "Dosya yüklenemedi veya desteklenmeyen tür", 400);
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      // Yüklenen dosyayı temizle
      fs.unlinkSync(req.file.path);
      return sendError(res, "Görev bulunamadı", 404);
    }

    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) {
      fs.unlinkSync(req.file.path);
      return sendError(res, "Bu projeye erişim yetkiniz yok", 403);
    }
    if (!["owner", "contributor"].includes(role)) {
      fs.unlinkSync(req.file.path);
      return sendError(res, "Bu işlem için yetkiniz yok", 403);
    }

    // Dosya URL'ini oluştur (production'da S3 URL olur, şimdilik local path)
    const file_url = `/uploads/${req.file.filename}`;
    const file_name = req.file.originalname;

    const attachment = await Attachment.create({
      task_id: req.params.id,
      file_url,
      file_name,
      uploaded_by: req.user.userId,
    });

    return sendSuccess(res, attachment, "Dosya yüklendi", 201);
  } catch (err) {
    // Hata durumunda yüklenen dosyayı temizle
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// DELETE /api/attachments/:id
const deleteAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return sendError(res, "Dosya bulunamadı", 404);

    const task = await Task.findById(attachment.task_id);
    const role = await ProjectMember.findRole(task.project_id, req.user.userId);

    const isUploader = attachment.uploaded_by === req.user.userId;
    const isOwner = role === "owner";

    if (!isUploader && !isOwner) {
      return sendError(res, "Bu dosyayı silme yetkiniz yok", 403);
    }

    // Fiziksel dosyayı sil
    const filePath = path.join(__dirname, "../../uploads", path.basename(attachment.file_url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Attachment.delete(req.params.id);
    return sendSuccess(res, null, "Dosya silindi");
  } catch (err) {
    next(err);
  }
};

// GET /api/attachments/:id/download
const downloadAttachment = async (req, res, next) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return sendError(res, "Dosya bulunamadı", 404);

    const task = await Task.findById(attachment.task_id);
    const role = await ProjectMember.findRole(task.project_id, req.user.userId);
    if (!role) return sendError(res, "Bu projeye erişim yetkiniz yok", 403);

    const filePath = path.join(__dirname, "../../uploads", path.basename(attachment.file_url));
    if (!fs.existsSync(filePath)) {
      return sendError(res, "Dosya sunucuda bulunamadı", 404);
    }

    res.download(filePath, attachment.file_name);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAttachments, uploadAttachment, deleteAttachment, downloadAttachment };