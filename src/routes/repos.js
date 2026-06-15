const express = require('express');
const router = express.Router();
const repoService = require('../services/repoService');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Create a new repository
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { name, description, isPrivate } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Repository name is required' });
  }

  const repo = await repoService.createRepository(
    req.user.id,
    name,
    description || '',
    isPrivate || false
  );

  res.status(201).json({ repo });
}));

// Get user's repositories
router.get('/user', authenticateToken, asyncHandler(async (req, res) => {
  const repos = await repoService.getUserRepositories(req.user.id);
  res.json({ repos });
}));

// Get repository details
router.get('/:owner/:repo', asyncHandler(async (req, res) => {
  const repo = await repoService.getRepository(req.params.owner, req.params.repo);

  if (!repo) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  if (repo.is_private && req.user?.id !== repo.owner_id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ repo });
}));

// Delete repository
router.delete('/:owner/:repo', authenticateToken, asyncHandler(async (req, res) => {
  const repo = await repoService.getRepository(req.params.owner, req.params.repo);

  if (!repo) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  if (repo.owner_id !== req.user.id) {
    return res.status(403).json({ error: 'Only owner can delete repository' });
  }

  await repoService.deleteRepository(repo.id);
  res.json({ message: 'Repository deleted' });
}));

module.exports = router;
