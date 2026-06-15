const fs = require('fs');
const path = require('path');

const REPOS_DIR = process.env.GIT_REPOS_DIR || './repos';

function ensureReposDir() {
  if (!fs.existsSync(REPOS_DIR)) {
    fs.mkdirSync(REPOS_DIR, { recursive: true });
  }
}

function getRepoPath(owner, repo) {
  return path.join(REPOS_DIR, owner, `${repo}.git`);
}

function getUserReposDir(owner) {
  return path.join(REPOS_DIR, owner);
}

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

module.exports = {
  ensureReposDir,
  getRepoPath,
  getUserReposDir,
  deleteDirectory,
  REPOS_DIR
};
