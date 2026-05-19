const pool = require('../config/pgClient');
const bcrypt = require('bcryptjs');

class PGUser {
  // Create a new user
  static async create({ name, email, password, googleId = null, avatar = null }) {
    try {
      let hashedPassword = password;
      
      // Only hash password if it exists (not Google-only users)
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
      
      const query = `
        INSERT INTO users (name, email, password, google_id, avatar)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, google_id, avatar, created_at;
      `;
      
      const result = await pool.query(query, [
        name,
        email,
        hashedPassword,
        googleId,
        avatar
      ]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1;';
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT id, name, email, google_id, avatar, created_at FROM users WHERE id = $1;';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by Google ID
  static async findByGoogleId(googleId) {
    try {
      const query = 'SELECT * FROM users WHERE google_id = $1;';
      const result = await pool.query(query, [googleId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Verify password
  static async verifyPassword(email, password) {
    try {
      const query = 'SELECT password FROM users WHERE email = $1;';
      const result = await pool.query(query, [email]);
      
      if (!result.rows[0]) return false;
      
      const match = await bcrypt.compare(password, result.rows[0].password);
      return match;
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Update user
  static async update(id, { name, email, avatar }) {
    try {
      const query = `
        UPDATE users 
        SET name = $1, email = $2, avatar = $3
        WHERE id = $4
        RETURNING id, name, email, google_id, avatar, created_at;
      `;
      
      const result = await pool.query(query, [name, email, avatar, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Check if user exists
  static async exists(email) {
    try {
      const query = 'SELECT id FROM users WHERE email = $1;';
      const result = await pool.query(query, [email]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking user: ${error.message}`);
    }
  }
}

module.exports = PGUser;