const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const attachmentController = require("../controllers/attachmentController");

router.use(authMiddleware);

// DELETE /api/attachments/:id
router.delete("/:id", attachmentController.deleteAttachment);

// GET /api/attachments/:id/download
router.get("/:id/download", attachmentController.downloadAttachment);

module.exports = router;