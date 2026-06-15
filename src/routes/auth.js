const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const user = await authService.registerUser(username, email, password);
  res.status(201).json({ user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  const result = await authService.loginUser(username, password);
  res.json(result);
}));

router.get('/user/:username', asyncHandler(async (req, res) => {
  const user = await authService.getUserByUsername(req.params.username);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
}));

module.exports = router;
