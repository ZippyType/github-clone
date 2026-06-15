const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { initializeDatabase } = require('./db/database');
const { ensureReposDir } = require('./utils/filesystem');
const authRoutes = require('./routes/auth');
const repoRoutes = require('./routes/repos');
const gitRoutes = require('./routes/git');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize database and file system
initializeDatabase();
ensureReposDir();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/git', gitRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GitHub Clone running on http://localhost:${PORT}`);
  console.log(`📁 Git repos stored in: ${process.env.GIT_REPOS_DIR || './repos'}`);
});

module.exports = app;
