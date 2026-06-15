# GitHub Clone

A self-hosted GitHub alternative that works with the standard Git CLI.

## Features

- ✅ Full Git HTTP protocol support (`git clone`, `git push`, `git pull`)
- ✅ User authentication & authorization
- ✅ Repository management
- ✅ SSH key support
- ✅ REST API
- ✅ Web interface
- ✅ Pull request workflow (coming soon)

## Quick Start

### Installation

```bash
git clone https://github.com/ZippyType/github-clone.git
cd github-clone
npm install
cp .env.example .env
npm run dev
```

### Using with Git CLI

```bash
# Create a new repository
curl -X POST http://localhost:3000/api/repos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"my-repo","description":"My repo"}'

# Clone the repository
git clone http://localhost:3000/git/username/my-repo.git

# Push changes
git push origin main
```

## Architecture

```
├── src/
│   ├── server.js          # Express server
│   ├── routes/            # API routes
│   ├── middleware/        # Auth, error handling
│   ├── controllers/       # Business logic
│   ├── services/          # Git operations
│   ├── db/                # Database setup
│   └── utils/             # Utilities
├── repos/                 # Git repositories storage
├── data/                  # SQLite database
└── public/                # Frontend files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Repositories
- `GET /api/repos` - List all public repositories
- `POST /api/repos` - Create a new repository
- `GET /api/repos/:owner/:repo` - Get repository details
- `DELETE /api/repos/:owner/:repo` - Delete repository

### Git Operations (Smart HTTP)
- `GET /git/:owner/:repo.git/info/refs` - Git discovery
- `POST /git/:owner/:repo.git/git-upload-pack` - Git fetch/pull
- `POST /git/:owner/:repo.git/git-receive-pack` - Git push

## License

MIT
