const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const sprintController = require("../controllers/sprintController");
const {
  createSprintValidator,
  updateSprintValidator,
} = require("../validators/sprintValidators");

// Tüm sprint endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// Not: rbac kontrolü sprint'in project_id'sine göre uygulanır.
// Kişi C controller'larında project_id'yi sprint'ten çekip rbac kontrolü yapmalı.

// ─── Sprint CRUD ─────────────────────────────────────────────
// GET    /api/sprints/:id   → Sprint detayı
// PUT    /api/sprints/:id   → Sprint güncelle
router
  .route("/:id")
  .get(sprintController.getSprint)
  .put(updateSprintValidator, sprintController.updateSprint);

// ─── Sprint durum geçişleri ──────────────────────────────────
// PATCH  /api/sprints/:id/start → Sprint başlat (status: planning → active)
router.patch("/:id/start", sprintController.startSprint);

// PATCH  /api/sprints/:id/end   → Sprint bitir (tamamlanmayanlar backlog'a)
router.patch("/:id/end", sprintController.endSprint);

// ─── Sprint görev yönetimi ───────────────────────────────────
// POST   /api/sprints/:id/tasks/:taskId → Görevi sprint'e ekle
// DELETE /api/sprints/:id/tasks/:taskId → Görevi sprint'ten çıkar
router
  .route("/:id/tasks/:taskId")
  .post(sprintController.addTaskToSprint)
  .delete(sprintController.removeTaskFromSprint);

module.exports = router;
