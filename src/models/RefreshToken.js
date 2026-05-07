const pool = require("../config/database");

const RefreshToken = {
  async create({ user_id, token, expires_at }) {
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user_id, token, expires_at],
    );
  },

  async findValid(token) {
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()",
      [token],
    );
    return result.rows[0] || null;
  },

  async revoke(token) {
    await pool.query(
      "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1",
      [token],
    );
  },

  async revokeAllForUser(userId) {
    await pool.query(
      "UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1",
      [userId],
    );
  },
};

module.exports = RefreshToken;
