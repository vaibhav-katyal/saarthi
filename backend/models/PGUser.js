const prisma = require('../config/prismaClient');
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
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          googleId,
          avatar
        }
      });
      
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return user || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by Google ID
  static async findByGoogleId(googleId) {
    try {
      const user = await prisma.user.findUnique({
        where: { googleId }
      });
      return user || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Verify password
  static async verifyPassword(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) return false;
      
      const match = await bcrypt.compare(password, user.password);
      return match;
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Update user
  static async update(id, { name, email, avatar }) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          name,
          email,
          avatar
        }
      });
      return user || null;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Check if user exists
  static async exists(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return !!user;
    } catch (error) {
      throw new Error(`Error checking user: ${error.message}`);
    }
  }
}

module.exports = PGUser;