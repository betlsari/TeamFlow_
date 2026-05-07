const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { updateCommentValidator } = require("../validators/commentValidators");

// Tüm yorum endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// ─── Tekil yorum işlemleri ───────────────────────────────────
// PUT    /api/comments/:id → Yorum güncelle (sadece yazar)
// DELETE /api/comments/:id → Yorum sil (yazar veya proje owner)
router
  .route("/:id")
  .put(updateCommentValidator, (req, res) => {
    // TODO: Kişi C — commentController.updateComment
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  })
  .delete((req, res) => {
    // TODO: Kişi C — commentController.deleteComment
    res
      .status(501)
      .json({ success: false, message: "Henüz implemente edilmedi" });
  });

module.exports = router;
