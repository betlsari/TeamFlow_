const { body, param } = require("express-validator");

const createProjectValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Proje başlığı zorunludur")
    .isLength({ max: 150 })
    .withMessage("Proje başlığı en fazla 150 karakter olabilir"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Açıklama en fazla 1000 karakter olabilir"),
];

const updateProjectValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Proje başlığı boş olamaz")
    .isLength({ max: 150 })
    .withMessage("Proje başlığı en fazla 150 karakter olabilir"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Açıklama en fazla 1000 karakter olabilir"),

  body("status")
    .optional()
    .isIn(["active", "archived", "completed"])
    .withMessage("Geçerli bir durum giriniz: active, archived, completed"),
];

const addMemberValidator = [
  body("user_id")
    .notEmpty()
    .withMessage("Kullanıcı ID zorunludur")
    .isUUID()
    .withMessage("Geçerli bir kullanıcı ID giriniz"),

  body("role")
    .optional()
    .isIn(["owner", "contributor", "viewer"])
    .withMessage("Geçerli bir rol giriniz: owner, contributor, viewer"),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
};
