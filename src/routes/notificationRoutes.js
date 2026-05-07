const Notification = require("../models/Notification");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const onlyUnread = req.query.unread === "true";
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await Notification.findByUser(req.user.userId, {
      limit,
      onlyUnread,
    });

    const unreadCount = await Notification.unreadCount(req.user.userId);

    return sendSuccess(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.markAsRead(
      req.params.id,
      req.user.userId,
    );

    if (!notification) {
      return sendError(res, "Bildirim bulunamadı", 404);
    }

    return sendSuccess(res, notification, "Bildirim okundu olarak işaretlendi");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.markAllAsRead(req.user.userId);
    return sendSuccess(res, null, "Tüm bildirimler okundu olarak işaretlendi");
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.delete(req.params.id, req.user.userId);
    return sendSuccess(res, null, "Bildirim silindi");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
