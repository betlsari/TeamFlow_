const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const rbac = require("../middleware/rbacMiddleware");
const projectController = require("../controllers/projectController");
const taskController = require("../controllers/taskController");
const labelController = require("../controllers/labelController");
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
} = require("../validators/projectValidators");
const {
  createTaskValidator,
} = require("../validators/taskValidators");
const {
  createLabelValidator,
} = require("../validators/labelValidators");

router.use(authMiddleware);

router
  .route("/")
  .post(createProjectValidator, projectController.createProject)
  .get(projectController.getProjects);

router
  .route("/:id")
  .get(rbac("owner", "contributor", "viewer"), projectController.getProject)
  .put(rbac("owner"), updateProjectValidator, projectController.updateProject)
  .delete(rbac("owner"), projectController.deleteProject);

router
  .route("/:id/members")
  .get(rbac("owner", "contributor", "viewer"), projectController.getMembers)
  .post(rbac("owner"), addMemberValidator, projectController.addMember);

router.delete("/:id/members/:userId", rbac("owner"), projectController.removeMember);

router.get("/:id/statistics", rbac("owner", "contributor", "viewer"), projectController.getStatistics);
router.get("/:id/activities", rbac("owner", "contributor", "viewer"), projectController.getActivities);

router
  .route("/:id/tasks")
  .get(rbac("owner", "contributor", "viewer"), taskController.getTasksByProject)
  .post(rbac("owner", "contributor"), createTaskValidator, taskController.createTask);

router
  .route("/:id/labels")
  .get(rbac("owner", "contributor", "viewer"), labelController.getLabelsByProject)
  .post(rbac("owner", "contributor"), createLabelValidator, labelController.createLabel);

router
  .route("/:id/sprints")
  .get(rbac("owner", "contributor", "viewer"), (req, res) => {
    res.status(501).json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .post(rbac("owner", "contributor"), (req, res) => {
    res.status(501).json({ success: false, message: "Henüz implemente edilmedi" });
  });

module.exports = router;