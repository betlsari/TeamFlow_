const pool = require("../config/database");
const { hashPassword, comparePassword } = require("../utils/passwordHelper");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtService");
const { sendSuccess, sendError } = require("../utils/responseHelper");
const { validationResult } = require("express-validator");

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validasyon hatası", 400, errors.array());
    }

    const { username, email, password, full_name } = req.body;

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existingUser.rows.length > 0) {
      return sendError(
        res,
        "Bu e-posta veya kullanıcı adı zaten kullanılıyor",
        409,
      );
    }

    const password_hash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, full_name, created_at`,
      [username, email, password_hash, full_name || null],
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt],
    );

    return sendSuccess(
      res,
      { user, accessToken, refreshToken },
      "Kayıt başarılı",
      201,
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validasyon hatası", 400, errors.array());
    }

    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return sendError(res, "E-posta veya şifre hatalı", 401);
    }

    const user = result.rows[0];
    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return sendError(res, "E-posta veya şifre hatalı", 401);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt],
    );

    const { password_hash, ...userWithoutPassword } = user;

    return sendSuccess(
      res,
      { user: userWithoutPassword, accessToken, refreshToken },
      "Giriş başarılı",
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, "Refresh token bulunamadı", 401);
    }

    const tokenRecord = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false",
      [refreshToken],
    );

    if (tokenRecord.rows.length === 0) {
      return sendError(res, "Geçersiz refresh token", 401);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded.userId);

    return sendSuccess(res, { accessToken }, "Token yenilendi");
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, "Refresh token bulunamadı", 400);
    }

    await pool.query(
      "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1",
      [refreshToken],
    );

    return sendSuccess(res, null, "Çıkış başarılı");
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, full_name, avatar_url, created_at FROM users WHERE id = $1",
      [req.user.userId],
    );

    if (result.rows.length === 0) {
      return sendError(res, "Kullanıcı bulunamadı", 404);
    }

    return sendSuccess(res, result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validasyon hatası", 400, errors.array());
    }

    const { full_name, avatar_url } = req.body;

    const result = await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name),
                        avatar_url = COALESCE($2, avatar_url)
       WHERE id = $3
       RETURNING id, username, email, full_name, avatar_url`,
      [full_name || null, avatar_url || null, req.user.userId],
    );

    return sendSuccess(res, result.rows[0], "Profil güncellendi");
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/password
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validasyon hatası", 400, errors.array());
    }

    const { current_password, new_password } = req.body;

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.userId],
    );

    const isMatch = await comparePassword(
      current_password,
      result.rows[0].password_hash,
    );

    if (!isMatch) {
      return sendError(res, "Mevcut şifre hatalı", 401);
    }

    const newHash = await hashPassword(new_password);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      req.user.userId,
    ]);

    await pool.query(
      "UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1",
      [req.user.userId],
    );

    return sendSuccess(res, null, "Şifre başarıyla değiştirildi");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
