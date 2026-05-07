const { verifyAccessToken } = require("../utils/jwtService");
const { sendError } = require("../utils/responseHelper");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Token bulunamadı", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, "Geçersiz veya süresi dolmuş token", 401);
  }
};

module.exports = authMiddleware;
