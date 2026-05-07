const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

// Tüm bildirim endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// GET /api/notifications
router.get("/", notificationController.getNotifications);

// PATCH /api/notifications/read-all  (/:id'den önce olmalı — route çakışmasını önler)
router.patch("/read-all", notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch("/:id/read", notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
