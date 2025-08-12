# SyncBoard Backend

## Quick Start

1. Start the development environment:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- POST   `/api/auth/register` - Register new user
- POST   `/api/auth/login` - Login user
- POST   `/api/auth/refresh` - Refresh access token
- POST   `/api/auth/logout` - Logout user
- GET    `/api/auth/me` - Get current user
- POST   `/api/auth/forgot-password` - Request password reset
- POST   `/api/auth/reset-password` - Reset password

### User Management
- GET    `/api/users/profile` - Get user profile
- PUT    `/api/users/profile` - Update user profile
- PUT    `/api/users/change-password` - Change password

### Team Management
- POST   `/api/teams` - Create team
- GET    `/api/teams` - Get user's teams
- GET    `/api/teams/:id` - Get team details
- PUT    `/api/teams/:id` - Update team
- DELETE `/api/teams/:id` - Delete team
- POST   `/api/teams/:id/members` - Invite team member
- PUT    `/api/teams/:id/members/:userId` - Update member role
- DELETE `/api/teams/:id/members/:userId` - Remove member

### Workspace Management
- POST   `/api/workspaces` - Create workspace
- GET    `/api/workspaces` - Get user's workspaces
- GET    `/api/workspaces/:id` - Get workspace details
- PUT    `/api/workspaces/:id` - Update workspace
- DELETE `/api/workspaces/:id` - Delete workspace
- POST   `/api/workspaces/:id/members` - Invite workspace member
- PUT    `/api/workspaces/:id/members/:userId` - Update member role
- DELETE `/api/workspaces/:id/members/:userId` - Remove member

### Board Management
- GET    `/api/boards/workspace/:workspaceId` - Get workspace boards
- POST   `/api/boards/workspace/:workspaceId` - Create board
- GET    `/api/boards/:id` - Get board details
- PUT    `/api/boards/:id` - Update board
- DELETE `/api/boards/:id` - Delete board
- POST   `/api/boards/:boardId/columns` - Create column
- PUT    `/api/boards/columns/:id` - Update column
- DELETE `/api/boards/columns/:id` - Delete column
- POST   `/api/boards/items` - Create item
- PUT    `/api/boards/items/:id` - Update item
- DELETE `/api/boards/items/:id` - Delete item
- POST   `/api/boards/items/:id/move` - Move item

### AI Assistant
- POST   `/api/ai/workspace/:workspaceId/request` - Process AI request
- POST   `/api/ai/workspace/:workspaceId/suggest-tasks` - Suggest tasks
- POST   `/api/ai/workspace/:workspaceId/summarize-meeting` - Summarize meeting
- POST   `/api/ai/workspace/:workspaceId/generate-timeline` - Generate timeline
- POST   `/api/ai/workspace/:workspaceId/review-code` - Review code
- GET    `/api/ai/workspace/:workspaceId/history` - Get AI history

### Notifications
- GET    `/api/notifications` - Get user notifications
- GET    `/api/notifications/unread-count` - Get unread count
- PUT    `/api/notifications/:id/read` - Mark notification as read
- PUT    `/api/notifications/mark-all-read` - Mark all as read

### File Management
- POST   `/api/files/items/:itemId/upload` - Upload attachment to item
- GET    `/api/files/items/:itemId` - Get item attachments
- DELETE `/api/files/attachments/:id` - Delete attachment

### Analytics & Reporting
- GET    `/api/analytics/workspace/:workspaceId/stats` - Get workspace statistics
- GET    `/api/analytics/workspace/:workspaceId/trends` - Get workspace trends
- GET    `/api/analytics/user/stats` - Get user statistics
- GET    `/api/analytics/team/:teamId/stats` - Get team statistics
- POST   `/api/analytics/events` - Track analytics event

### Invitations
- POST   `/api/invitations/accept` - Accept invitation
- POST   `/api/invitations/decline` - Decline invitation
- POST   `/api/invitations/resend` - Resend invitation
- GET  `/api/invitations/pending` - Get pending invitations
- GET  `/api/invitations/:id` - Get invitation details

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://syncboard:syncboard@localhost:5432/syncboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=http://localhost:5173
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client