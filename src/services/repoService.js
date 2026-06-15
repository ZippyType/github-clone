const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const gitService = require('./gitService');

class RepositoryService {
  async createRepository(ownerId, name, description, isPrivate = false) {
    const repoId = uuidv4();

    try {
      await run(
        'INSERT INTO repositories (id, owner_id, name, description, is_private) VALUES (?, ?, ?, ?, ?)',
        [repoId, ownerId, name, description, isPrivate ? 1 : 0]
      );

      // Create git bare repository
      const owner = await get('SELECT username FROM users WHERE id = ?', [ownerId]);
      await gitService.createBareRepository(owner.username, name);

      return {
        id: repoId,
        ownerId,
        name,
        description,
        isPrivate
      };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        throw new Error('Repository with this name already exists');
      }
      throw error;
    }
  }

  async getRepository(owner, repo) {
    return get(
      `SELECT r.* FROM repositories r
       JOIN users u ON r.owner_id = u.id
       WHERE u.username = ? AND r.name = ?`,
      [owner, repo]
    );
  }

  async getUserRepositories(userId) {
    return all(
      'SELECT * FROM repositories WHERE owner_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  async deleteRepository(repoId) {
    const repo = await get('SELECT r.*, u.username FROM repositories r JOIN users u ON r.owner_id = u.id WHERE r.id = ?', [repoId]);
    
    if (!repo) {
      throw new Error('Repository not found');
    }

    // Delete from git
    await gitService.deleteRepository(repo.username, repo.name);

    // Delete from database
    await run('DELETE FROM repositories WHERE id = ?', [repoId]);
  }

  async updateRepository(repoId, updates) {
    const allowedFields = ['description', 'is_private'];
    const fields = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = ?`);

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    const values = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => updates[key]);

    values.push(repoId);

    await run(
      `UPDATE repositories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }
}

module.exports = new RepositoryService();
