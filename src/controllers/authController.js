const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
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

    const exists = await User.existsByEmailOrUsername(email, username);
    if (exists) {
      return sendError(
        res,
        "Bu e-posta veya kullanıcı adı zaten kullanılıyor",
        409,
      );
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

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

    const user = await User.findByEmail(email);
    if (!user) {
      return sendError(res, "E-posta veya şifre hatalı", 401);
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, "E-posta veya şifre hatalı", 401);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    });

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

    const tokenRecord = await RefreshToken.findValid(refreshToken);
    if (!tokenRecord) {
      return sendError(res, "Geçersiz veya süresi dolmuş refresh token", 401);
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      await RefreshToken.revoke(refreshToken);
      return sendError(res, "Geçersiz refresh token", 401);
    }

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

    await RefreshToken.revoke(refreshToken);

    return sendSuccess(res, null, "Çıkış başarılı");
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return sendError(res, "Kullanıcı bulunamadı", 404);
    }

    return sendSuccess(res, user);
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

    const updatedUser = await User.updateProfile(req.user.userId, {
      full_name,
      avatar_url,
    });

    return sendSuccess(res, updatedUser, "Profil güncellendi");
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

    // Şifreyi almak için doğrudan findByEmail değil özel sorgu kullanıyoruz
    // çünkü findById password_hash döndürmüyor (güvenlik)
    const user = await User.findByEmail(
      (await User.findById(req.user.userId)).email,
    );

    const isMatch = await comparePassword(current_password, user.password_hash);
    if (!isMatch) {
      return sendError(res, "Mevcut şifre hatalı", 401);
    }

    const newHash = await hashPassword(new_password);
    await User.updatePassword(req.user.userId, newHash);

    // Şifre değişince tüm refresh token'ları iptal et
    await RefreshToken.revokeAllForUser(req.user.userId);

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
