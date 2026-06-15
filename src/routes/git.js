const express = require('express');
const router = express.Router();
const path = require('path');
const { spawn } = require('child_process');
const { basicAuth } = require('../middleware/auth');
const { getRepoPath } = require('../utils/filesystem');
const repoService = require('../services/repoService');
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

// Smart HTTP Git endpoint for discovery
router.get('/:owner/:repo.git/info/refs', asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;
  const service = req.query.service;

  // Validate repository exists
  const repository = await repoService.getRepository(owner, repo);
  if (!repository) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  const repoPath = getRepoPath(owner, repo);
  const git = spawn('git', ['--bare', 'upload-pack', '--stateless-rpc', '--advertise-refs', repoPath]);

  res.setHeader('Content-Type', `application/x-${service}-result`);
  res.setHeader('Cache-Control', 'no-cache');

  let output = '';
  if (service) {
    output += `001e# service=${service}\n0000`;
  }

  git.stdout.on('data', (data) => {
    res.write(data);
  });

  git.on('close', (code) => {
    res.end();
  });

  git.on('error', (err) => {
    res.status(500).json({ error: 'Git error' });
  });
}));

// Git upload-pack (fetch/pull)
router.post('/:owner/:repo.git/git-upload-pack', asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;

  const repository = await repoService.getRepository(owner, repo);
  if (!repository) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  const repoPath = getRepoPath(owner, repo);
  const git = spawn('git', ['--bare', 'upload-pack', '--stateless-rpc', repoPath]);

  res.setHeader('Content-Type', 'application/x-git-upload-pack-result');
  res.setHeader('Cache-Control', 'no-cache');

  req.pipe(git.stdin);

  git.stdout.on('data', (data) => {
    res.write(data);
  });

  git.on('close', (code) => {
    res.end();
  });

  git.on('error', (err) => {
    res.status(500).json({ error: 'Git error' });
  });
}));

// Git receive-pack (push)
router.post('/:owner/:repo.git/git-receive-pack', basicAuth, asyncHandler(async (req, res) => {
  const { owner, repo } = req.params;
  const { username, password } = req.gitAuth;

  // Authenticate user
  const user = await authService.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify repository ownership or collaboration
  const repository = await repoService.getRepository(owner, repo);
  if (!repository) {
    return res.status(404).json({ error: 'Repository not found' });
  }

  const repoPath = getRepoPath(owner, repo);
  const git = spawn('git', ['--bare', 'receive-pack', '--stateless-rpc', repoPath]);

  res.setHeader('Content-Type', 'application/x-git-receive-pack-result');
  res.setHeader('Cache-Control', 'no-cache');

  req.pipe(git.stdin);

  git.stdout.on('data', (data) => {
    res.write(data);
  });

  git.on('close', (code) => {
    res.end();
  });

  git.on('error', (err) => {
    res.status(500).json({ error: 'Git error' });
  });
}));

module.exports = router;
