const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Tüm etiket endpoint'leri auth gerektiriyor
router.use(authMiddleware);

// ─── Tekil etiket işlemleri ──────────────────────────────────
// DELETE /api/labels/:id → Etiketi sil (owner/contributor)
// Not: Proje üyeliği ve rol kontrolü Kişi B'nin controller'ında yapılmalı
router.delete("/:id", (req, res) => {
  // TODO: Kişi B — labelController.deleteLabel
  res
    .status(501)
    .json({ success: false, message: "Henüz implemente edilmedi" });
});

module.exports = router;
