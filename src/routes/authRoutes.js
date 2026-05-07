const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  updateProfileValidator,
} = require("../validators/authValidators");

router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.get("/me", authMiddleware, authController.getMe);
router.put(
  "/profile",
  authMiddleware,
  updateProfileValidator,
  authController.updateProfile,
);
router.put(
  "/password",
  authMiddleware,
  changePasswordValidator,
  authController.changePassword,
);

module.exports = router;
