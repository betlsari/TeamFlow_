const { body } = require("express-validator");

const createCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Yorum içeriği zorunludur")
    .isLength({ max: 2000 })
    .withMessage("Yorum en fazla 2000 karakter olabilir"),

  body("parent_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Geçerli bir üst yorum ID giriniz"),
];

const updateCommentValidator = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Yorum içeriği zorunludur")
    .isLength({ max: 2000 })
    .withMessage("Yorum en fazla 2000 karakter olabilir"),
];

module.exports = {
  createCommentValidator,
  updateCommentValidator,
};
