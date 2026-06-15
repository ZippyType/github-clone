const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { getRepoPath } = require('../utils/filesystem');
const { v4: uuidv4 } = require('uuid');

class GitService {
  async initializeRepository(owner, repo) {
    const repoPath = getRepoPath(owner, repo);
    const dir = path.dirname(repoPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const git = simpleGit();
    await git.clone('--bare', 'https://github.com/git/git.git', repoPath).catch(() => {
      // If clone fails, init as bare repo
      fs.mkdirSync(repoPath, { recursive: true });
      const bareGit = simpleGit(repoPath);
      return bareGit.init(['--bare']);
    });

    return repoPath;
  }

  async createBareRepository(owner, repo) {
    const repoPath = getRepoPath(owner, repo);
    const dir = path.dirname(repoPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.mkdirSync(repoPath, { recursive: true });
    const git = simpleGit(repoPath);
    await git.init(['--bare']);

    return repoPath;
  }

  async getRepositoryInfo(owner, repo) {
    const repoPath = getRepoPath(owner, repo);

    if (!fs.existsSync(repoPath)) {
      throw new Error('Repository not found');
    }

    const git = simpleGit(repoPath);
    const refs = await git.raw(['show-ref']);
    const config = await git.raw(['config', '--list']);

    return {
      path: repoPath,
      refs,
      config
    };
  }

  getRepoPath(owner, repo) {
    return getRepoPath(owner, repo);
  }

  async listRepositories(owner) {
    const ownerDir = path.join(process.env.GIT_REPOS_DIR || './repos', owner);
    
    if (!fs.existsSync(ownerDir)) {
      return [];
    }

    const files = fs.readdirSync(ownerDir);
    return files.filter(f => f.endsWith('.git'));
  }

  async deleteRepository(owner, repo) {
    const repoPath = getRepoPath(owner, repo);
    
    if (!fs.existsSync(repoPath)) {
      throw new Error('Repository not found');
    }

    fs.rmSync(repoPath, { recursive: true, force: true });
  }
}

module.exports = new GitService();
