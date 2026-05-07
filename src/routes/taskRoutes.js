const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  assigneeValidator,
} = require("../validators/taskValidators");

// Tüm görev endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// Not: rbac burada task'ın project_id'sine göre uygulanır.
// Kişi B controller'larında project_id'yi task'tan çekip rbac kontrolü yapmalı.

// ─── Görev CRUD ──────────────────────────────────────────────
// GET    /api/tasks/:id   → Görev detayı (assignees + labels dahil)
// PUT    /api/tasks/:id   → Görev güncelle
// DELETE /api/tasks/:id   → Görev sil
router
  .route("/:id")
  .get((req, res) => {
    // TODO: Kişi B — taskController.getTask
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .put(updateTaskValidator, (req, res) => {
    // TODO: Kişi B — taskController.updateTask
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .delete((req, res) => {
    // TODO: Kişi B — taskController.deleteTask
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// ─── Durum değiştirme (Kanban) ───────────────────────────────
// PATCH  /api/tasks/:id/status
router.patch("/:id/status", updateTaskStatusValidator, (req, res) => {
  // TODO: Kişi B — taskController.updateTaskStatus
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// ─── Atamalar ────────────────────────────────────────────────
// GET    /api/tasks/:id/assignees
// POST   /api/tasks/:id/assignees
router
  .route("/:id/assignees")
  .get((req, res) => {
    // TODO: Kişi B — taskController.getAssignees
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post(assigneeValidator, (req, res) => {
    // TODO: Kişi B — taskController.addAssignee
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// DELETE /api/tasks/:id/assignees/:userId
router.delete("/:id/assignees/:userId", (req, res) => {
  // TODO: Kişi B — taskController.removeAssignee
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// ─── Etiketler (görev bazlı) ─────────────────────────────────
// POST   /api/tasks/:id/labels
router.post("/:id/labels", (req, res) => {
  // TODO: Kişi B — labelController.addLabelToTask
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// DELETE /api/tasks/:id/labels/:labelId
router.delete("/:id/labels/:labelId", (req, res) => {
  // TODO: Kişi B — labelController.removeLabelFromTask
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// ─── Yorumlar (görev bazlı) ──────────────────────────────────
// GET    /api/tasks/:id/comments
// POST   /api/tasks/:id/comments
router
  .route("/:id/comments")
  .get((req, res) => {
    // TODO: Kişi C — commentController.getComments
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post((req, res) => {
    // TODO: Kişi C — commentController.createComment
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// ─── Ekler (görev bazlı) ─────────────────────────────────────
// GET    /api/tasks/:id/attachments
// POST   /api/tasks/:id/attachments
// (Multer middleware Kişi C tarafından eklenecek)
router
  .route("/:id/attachments")
  .get((req, res) => {
    // TODO: Kişi C — attachmentController.getAttachments
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post((req, res) => {
    // TODO: Kişi C — attachmentController.uploadAttachment
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

module.exports = router;
