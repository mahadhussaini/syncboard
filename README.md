# SyncBoard - Real-Time Collaborative Workspace SaaS

A modern, AI-powered collaborative workspace for remote teams featuring real-time collaboration, AI assistance, and offline-first capabilities.

## 🚀 Features

- **Multi-user Live Collaboration** - Shared whiteboards, Kanban boards, and notes with instant sync
- **AI Assistant Integration** - Task suggestions, meeting summaries, and timeline generation
- **Advanced RBAC** - Role-based access control with team owners, admins, and members
- **Offline-First Mode** - Local change queuing with automatic sync when online
- **Real-Time Updates** - Redis Pub/Sub for instant notifications and activity feeds
- **Analytics Dashboard** - Productivity trends and task completion analytics
- **Document Storage** - S3 integration for file uploads and media management
- **Customizable Workspaces** - Templates for Agile, brainstorming, and project tracking

## 🛠 Tech Stack

### Frontend
- React 18 with Vite
- Zustand for state management
- Tailwind CSS for styling
- Socket.IO client for real-time updates
- React Router for navigation

### Backend
- Node.js with Express
- Socket.IO for WebSocket connections
- Redis for caching, pub/sub, and sessions
- PostgreSQL with Prisma ORM
- JWT authentication with refresh tokens

### DevOps
- Docker Compose for local development
- Nginx reverse proxy
- S3-compatible storage

## 📁 Project Structure

```
syncboard/
├── frontend/                 # React frontend application
├── backend/                  # Node.js backend API
├── shared/                   # Shared types and utilities
├── docker/                   # Docker configuration files
├── docs/                     # Documentation
└── docker-compose.yml        # Development environment setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Development Setup

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd syncboard
   ```

2. **Start development environment:**
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies:**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd backend && npm install
   ```

4. **Run development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Adminer (DB): http://localhost:8080

## 🔧 Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories:

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://syncboard:password@localhost:5432/syncboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
S3_BUCKET=syncboard-files
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## 📚 API Documentation

The API documentation is available at `/api/docs` when the backend is running.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details. 