const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { run, get } = require('../db/database');

class AuthService {
  async registerUser(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    try {
      await run(
        'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [userId, username, email, hashedPassword]
      );

      return { id: userId, username, email };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  async loginUser(username, password) {
    const user = await get('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email }
    };
  }

  async getUserByUsername(username) {
    return get('SELECT id, username, email, created_at FROM users WHERE username = ?', [username]);
  }

  async getUserById(id) {
    return get('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
  }
}

module.exports = new AuthService();
