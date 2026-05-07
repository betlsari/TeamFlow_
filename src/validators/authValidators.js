const { body } = require("express-validator");

const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Kullanıcı adı zorunludur")
    .isLength({ min: 3, max: 50 })
    .withMessage("Kullanıcı adı 3-50 karakter olmalıdır")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Kullanıcı adı sadece harf, rakam ve _ içerebilir"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("E-posta zorunludur")
    .isEmail()
    .withMessage("Geçerli bir e-posta giriniz"),

  body("password")
    .notEmpty()
    .withMessage("Şifre zorunludur")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalıdır"),

  body("full_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Ad soyad en fazla 100 karakter olabilir"),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("E-posta zorunludur")
    .isEmail()
    .withMessage("Geçerli bir e-posta giriniz"),

  body("password").notEmpty().withMessage("Şifre zorunludur"),
];

const changePasswordValidator = [
  body("current_password").notEmpty().withMessage("Mevcut şifre zorunludur"),

  body("new_password")
    .notEmpty()
    .withMessage("Yeni şifre zorunludur")
    .isLength({ min: 6 })
    .withMessage("Yeni şifre en az 6 karakter olmalıdır"),
];

const updateProfileValidator = [
  body("full_name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Ad soyad en fazla 100 karakter olabilir"),

  body("avatar_url")
    .optional()
    .trim()
    .isURL()
    .withMessage("Geçerli bir URL giriniz"),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
};
