const { body } = require("express-validator");

const createSprintValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Sprint adı zorunludur")
    .isLength({ max: 100 })
    .withMessage("Sprint adı en fazla 100 karakter olabilir"),

  body("goal")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Sprint hedefi en fazla 500 karakter olabilir"),

  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Geçerli bir başlangıç tarihi giriniz (ISO 8601 formatı)"),

  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("Geçerli bir bitiş tarihi giriniz (ISO 8601 formatı)")
    .custom((end_date, { req }) => {
      if (req.body.start_date && end_date <= req.body.start_date) {
        throw new Error("Bitiş tarihi başlangıç tarihinden sonra olmalıdır");
      }
      return true;
    }),
];

const updateSprintValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Sprint adı boş olamaz")
    .isLength({ max: 100 })
    .withMessage("Sprint adı en fazla 100 karakter olabilir"),

  body("goal")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Sprint hedefi en fazla 500 karakter olabilir"),

  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Geçerli bir başlangıç tarihi giriniz"),

  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("Geçerli bir bitiş tarihi giriniz"),
];

module.exports = {
  createSprintValidator,
  updateSprintValidator,
};
