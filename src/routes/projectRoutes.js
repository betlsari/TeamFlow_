const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
} = require("../validators/projectValidators");

// Tüm proje endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// ─── Projeler ───────────────────────────────────────────────
// POST   /api/projects          → Yeni proje oluştur
// GET    /api/projects          → Kullanıcının projelerini listele
router
  .route("/")
  .post(createProjectValidator, (req, res) => {
    // TODO: Kişi B — projectController.createProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .get((req, res) => {
    // TODO: Kişi B — projectController.getProjects
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// GET    /api/projects/:id      → Proje detayı
// PUT    /api/projects/:id      → Proje güncelle (owner)
// DELETE /api/projects/:id      → Proje sil (owner)
router
  .route("/:id")
  .get(rbac("owner", "contributor", "viewer"), (req, res) => {
    // TODO: Kişi B — projectController.getProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .put(rbac("owner"), updateProjectValidator, (req, res) => {
    // TODO: Kişi B — projectController.updateProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .delete(rbac("owner"), (req, res) => {
    // TODO: Kişi B — projectController.deleteProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// ─── Üyeler ─────────────────────────────────────────────────
// GET    /api/projects/:id/members         → Üye listesi
// POST   /api/projects/:id/members         → Üye ekle (owner)
router
  .route("/:id/members")
  .get(rbac("owner", "contributor", "viewer"), (req, res) => {
    // TODO: Kişi B — projectController.getMembers
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post(rbac("owner"), addMemberValidator, (req, res) => {
    // TODO: Kişi B — projectController.addMember
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// DELETE /api/projects/:id/members/:userId → Üye çıkar (owner)
router.delete("/:id/members/:userId", rbac("owner"), (req, res) => {
  // TODO: Kişi B — projectController.removeMember
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

// ─── İstatistikler & Aktiviteler ────────────────────────────
// GET    /api/projects/:id/statistics
router.get(
  "/:id/statistics",
  rbac("owner", "contributor", "viewer"),
  (req, res) => {
    // TODO: Kişi B — projectController.getStatistics
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  },
);

// GET    /api/projects/:id/activities
router.get(
  "/:id/activities",
  rbac("owner", "contributor", "viewer"),
  (req, res) => {
    // TODO: Kişi B — projectController.getActivities
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  },
);

// ─── Görevler (proje bazlı) ──────────────────────────────────
// GET    /api/projects/:id/tasks
// POST   /api/projects/:id/tasks
router
  .route("/:id/tasks")
  .get(rbac("owner", "contributor", "viewer"), (req, res) => {
    // TODO: Kişi B — taskController.getTasksByProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post(rbac("owner", "contributor"), (req, res) => {
    // TODO: Kişi B — taskController.createTask
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// ─── Etiketler (proje bazlı) ─────────────────────────────────
// GET    /api/projects/:id/labels
// POST   /api/projects/:id/labels
router
  .route("/:id/labels")
  .get(rbac("owner", "contributor", "viewer"), (req, res) => {
    // TODO: Kişi B — labelController.getLabelsByProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post(rbac("owner", "contributor"), (req, res) => {
    // TODO: Kişi B — labelController.createLabel
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

// ─── Sprint'ler (proje bazlı) ────────────────────────────────
// GET    /api/projects/:id/sprints
// POST   /api/projects/:id/sprints
router
  .route("/:id/sprints")
  .get(rbac("owner", "contributor", "viewer"), (req, res) => {
    // TODO: Kişi C — sprintController.getSprintsByProject
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post(rbac("owner", "contributor"), (req, res) => {
    // TODO: Kişi C — sprintController.createSprint
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

module.exports = router;
