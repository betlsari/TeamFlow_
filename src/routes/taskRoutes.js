const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");
const labelController = require("../controllers/labelController");
const {
  updateTaskValidator,
  updateTaskStatusValidator,
  assigneeValidator,
} = require("../validators/taskValidators");
const { addLabelToTaskValidator } = require("../validators/labelValidators");
const commentController = require("../controllers/commentController");
const {createCommentValidator} = require("../validators/commentValidators");
const attachmentController = require("../controllers/attachmentController");
const upload = require("../config/multer");
router.use(authMiddleware);

router
  .route("/:id")
  .get(taskController.getTask)
  .put(updateTaskValidator, taskController.updateTask)
  .delete(taskController.deleteTask);

router.patch("/:id/status", updateTaskStatusValidator, taskController.updateTaskStatus);

router
  .route("/:id/assignees")
  .get(taskController.getAssignees)
  .post(assigneeValidator, taskController.addAssignee);

router.delete("/:id/assignees/:userId", taskController.removeAssignee);

router.post("/:id/labels", addLabelToTaskValidator, labelController.addLabelToTask);
router.delete("/:id/labels/:labelId", labelController.removeLabelFromTask);

router
  .route("/:id/comments")
  .get(commentController.getComments)
  .post(createCommentValidator, commentController.createComment);

router
  .route("/:id/attachments")
  .get(attachmentController.getAttachments)
  .post(upload.single("file"), attachmentController.uploadAttachment);

module.exports = router;