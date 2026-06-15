const app = {
  token: localStorage.getItem('token') || null,
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,

  init() {
    this.render();
    this.setupEventListeners();
  },

  render() {
    const appDiv = document.getElementById('app');
    if (this.currentUser) {
      appDiv.innerHTML = this.renderDashboard();
    } else {
      appDiv.innerHTML = this.renderAuthPage();
    }
  },

  renderAuthPage() {
    return `
      <header>
        <h1>🚀 GitHub Clone</h1>
        <p>A self-hosted Git platform</p>
      </header>
      <main>
        <div class="card" style="max-width: 400px; margin: 3rem auto;">
          <h2>Login or Register</h2>
          <div id="auth-message"></div>
          <form id="auth-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required>
            </div>
            <button type="submit" class="button" style="width: 100%;">Login</button>
            <button type="button" class="button button-secondary" style="width: 100%;" onclick="app.toggleRegister()">Register</button>
          </form>
        </div>
      </main>
    `;
  },

  renderDashboard() {
    return `
      <header>
        <h1>🚀 GitHub Clone</h1>
        <p>Welcome, ${this.currentUser.username}! | <a href="#" onclick="app.logout()" style="color: white; text-decoration: underline;">Logout</a></p>
      </header>
      <main>
        <div class="card">
          <h2>Your Repositories</h2>
          <button class="button" onclick="app.showCreateRepo()">+ New Repository</button>
          <div id="repos-container" style="margin-top: 1rem;"></div>
        </div>
      </main>
    `;
  },

  setupEventListeners() {
    const form = document.getElementById('auth-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleLogin(e));
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.render();
      } else {
        document.getElementById('auth-message').innerHTML = '<div class="error">Login failed</div>';
      }
    } catch (error) {
      document.getElementById('auth-message').innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.token = null;
    this.currentUser = null;
    this.render();
  },

  toggleRegister() {
    // Implement toggle for register/login
    alert('Register not yet implemented in UI. Use API endpoint /api/auth/register');
  },

  showCreateRepo() {
    alert('Create repo form coming soon');
  }
};

app.init();
