const { body } = require("express-validator");

const createLabelValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Etiket adı zorunludur")
    .isLength({ max: 50 })
    .withMessage("Etiket adı en fazla 50 karakter olabilir"),

  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Geçerli bir hex renk kodu giriniz (örn: #FF5733)"),
];

const addLabelToTaskValidator = [
  body("label_id")
    .notEmpty()
    .withMessage("Etiket ID zorunludur")
    .isUUID()
    .withMessage("Geçerli bir etiket ID giriniz"),
];

module.exports = {
  createLabelValidator,
  addLabelToTaskValidator,
};
