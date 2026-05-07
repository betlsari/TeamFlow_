const errorHandler = (err, req, res, next) => {
  console.error(`[HATA] ${err.message}`);

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ success: false, message: "Yetkisiz erişim" });
  }

  if (err.code === "23505") {
    return res
      .status(409)
      .json({ success: false, message: "Bu kayıt zaten mevcut" });
  }

  if (err.code === "23503") {
    return res
      .status(404)
      .json({ success: false, message: "İlgili kayıt bulunamadı" });
  }

  return res.status(500).json({
    success: false,
    message: "Sunucu hatası",
  });
};

module.exports = errorHandler;
