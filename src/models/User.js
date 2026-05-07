const pool = require("../config/database");

const User = {
  async findById(id) {
    const result = await pool.query(
      "SELECT id, username, email, full_name, avatar_url, created_at FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0] || null;
  },

  async create({ username, email, password_hash, full_name }) {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, full_name, created_at`,
      [username, email, password_hash, full_name || null],
    );
    return result.rows[0];
  },

  async updateProfile(id, { full_name, avatar_url }) {
    const result = await pool.query(
      `UPDATE users
       SET full_name   = COALESCE($1, full_name),
           avatar_url  = COALESCE($2, avatar_url)
       WHERE id = $3
       RETURNING id, username, email, full_name, avatar_url`,
      [full_name || null, avatar_url || null, id],
    );
    return result.rows[0];
  },

  async updatePassword(id, password_hash) {
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      password_hash,
      id,
    ]);
  },

  async existsByEmailOrUsername(email, username) {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );
    return result.rows.length > 0;
  },
};

module.exports = User;
