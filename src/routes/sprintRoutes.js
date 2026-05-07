const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
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
  .get((req, res) => {
    // TODO: Kişi C — sprintController.getSprint
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .put(updateSprintValidator, (req, res) => {
    // TODO: Kişi C — sprintController.updateSprint
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// ─── Sprint durum geçişleri ──────────────────────────────────
// PATCH  /api/sprints/:id/start → Sprint başlat (status: planning → active)
router.patch("/:id/start", (req, res) => {
  // TODO: Kişi C — sprintController.startSprint
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// PATCH  /api/sprints/:id/end   → Sprint bitir (tamamlanmayanlar backlog'a)
router.patch("/:id/end", (req, res) => {
  // TODO: Kişi C — sprintController.endSprint
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// ─── Sprint görev yönetimi ───────────────────────────────────
// POST   /api/sprints/:id/tasks/:taskId → Görevi sprint'e ekle
// DELETE /api/sprints/:id/tasks/:taskId → Görevi sprint'ten çıkar
router
  .route("/:id/tasks/:taskId")
  .post((req, res) => {
    // TODO: Kişi C — sprintController.addTaskToSprint
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .delete((req, res) => {
    // TODO: Kişi C — sprintController.removeTaskFromSprint
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

module.exports = router;
