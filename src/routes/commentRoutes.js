const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const commentController = require("../controllers/commentController");
const { updateCommentValidator } = require("../validators/commentValidators");

// Tüm yorum endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// ─── Tekil yorum işlemleri ───────────────────────────────────
// PUT    /api/comments/:id → Yorum güncelle (sadece yazar)
// DELETE /api/comments/:id → Yorum sil (yazar veya proje owner)
router
  .route("/:id")
  .put(updateCommentValidator, commentController.updateComment)
  .delete(commentController.deleteComment);

module.exports = router;
