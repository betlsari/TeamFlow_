const { body } = require("express-validator");

const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Görev başlığı zorunludur")
    .isLength({ max: 255 })
    .withMessage("Görev başlığı en fazla 255 karakter olabilir"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Açıklama en fazla 2000 karakter olabilir"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "done"])
    .withMessage("Geçerli bir durum giriniz: todo, in_progress, done"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Geçerli bir öncelik giriniz: low, medium, high, critical"),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Geçerli bir tarih giriniz (ISO 8601 formatı)"),

  body("sprint_id")
    .optional()
    .isUUID()
    .withMessage("Geçerli bir sprint ID giriniz"),
];

const updateTaskValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Görev başlığı boş olamaz")
    .isLength({ max: 255 })
    .withMessage("Görev başlığı en fazla 255 karakter olabilir"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Açıklama en fazla 2000 karakter olabilir"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "done"])
    .withMessage("Geçerli bir durum giriniz: todo, in_progress, done"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Geçerli bir öncelik giriniz: low, medium, high, critical"),

  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Geçerli bir tarih giriniz (ISO 8601 formatı)"),

  body("sprint_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Geçerli bir sprint ID giriniz"),
];

const updateTaskStatusValidator = [
  body("status")
    .notEmpty()
    .withMessage("Durum zorunludur")
    .isIn(["todo", "in_progress", "done"])
    .withMessage("Geçerli bir durum giriniz: todo, in_progress, done"),
];

const assigneeValidator = [
  body("user_id")
    .notEmpty()
    .withMessage("Kullanıcı ID zorunludur")
    .isUUID()
    .withMessage("Geçerli bir kullanıcı ID giriniz"),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  assigneeValidator,
};
