# MiniJira — Backend

A RESTful API for the MiniJira project management application, built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (via `pg` connection pool)
- **Auth:** JWT (access token + refresh token rotation)
- **Validation:** express-validator
- **Password Hashing:** bcrypt

## Features

- JWT-based authentication with refresh token rotation and revocation
- Role-based access control (RBAC) — `owner`, `contributor`, `viewer`
- Full project lifecycle: create, update, archive, delete
- Task management with status (`todo`, `in_progress`, `done`) and priority (`low`, `medium`, `high`, `critical`)
- Sprint management: planning → active → completed, with automatic backlog fallback
- Nested comments (threaded replies) on tasks
- File attachments per task
- Label management per project
- Activity log for project events
- Project statistics endpoint

## Project Structure

```
src/
├── config/
│   └── database.js          # PostgreSQL pool setup
├── controllers/
│   ├── authController.js
│   ├── projectController.js
│   ├── taskController.js
│   ├── sprintController.js
│   ├── labelController.js
│   └── commentController.js
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   └── rbacMiddleware.js     # Role-based access control
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Task.js
│   ├── Sprint.js
│   ├── Comment.js
│   ├── Label.js
│   ├── ProjectMember.js
│   ├── RefreshToken.js
│   └── ActivityLog.js
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   └── sprintRoutes.js
├── utils/
│   ├── jwtService.js
│   ├── passwordHelper.js
│   └── responseHelper.js
└── validators/
    ├── authValidators.js
    ├── projectValidators.js
    ├── taskValidators.js
    ├── sprintValidators.js
    └── labelValidators.js
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| PUT | `/api/auth/password` | Change password (revokes all refresh tokens) |

### Projects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects` | Authenticated |
| POST | `/api/projects` | Authenticated |
| GET | `/api/projects/:id` | owner / contributor / viewer |
| PUT | `/api/projects/:id` | owner |
| DELETE | `/api/projects/:id` | owner |
| GET | `/api/projects/:id/statistics` | owner / contributor / viewer |
| GET | `/api/projects/:id/activities` | owner / contributor / viewer |

### Members
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects/:id/members` | owner / contributor / viewer |
| POST | `/api/projects/:id/members` | owner |
| DELETE | `/api/projects/:id/members/:userId` | owner |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects/:id/tasks` | owner / contributor / viewer |
| POST | `/api/projects/:id/tasks` | owner / contributor |
| GET | `/api/tasks/:id` | project member |
| PUT | `/api/tasks/:id` | owner / contributor |
| DELETE | `/api/tasks/:id` | owner / contributor |
| PATCH | `/api/tasks/:id/status` | owner / contributor |

### Sprints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/sprints` | List project sprints |
| POST | `/api/projects/:id/sprints` | Create sprint |
| GET | `/api/sprints/:id` | Sprint detail |
| PUT | `/api/sprints/:id` | Update sprint |
| PATCH | `/api/sprints/:id/start` | Start sprint (planning → active) |
| PATCH | `/api/sprints/:id/end` | End sprint (unfinished tasks → backlog) |
| POST | `/api/sprints/:id/tasks/:taskId` | Add task to sprint |
| DELETE | `/api/sprints/:id/tasks/:taskId` | Remove task from sprint |

### Labels
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/projects/:id/labels` | owner / contributor / viewer |
| POST | `/api/projects/:id/labels` | owner / contributor |
| DELETE | `/api/labels/:id` | owner / contributor |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
git clone <repo-url>
cd minijira-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=minijira
DB_USER=postgres
DB_PASSWORD=your_password

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

## Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "message": "Hata mesajı",
  "errors": [ ... ]
}
```

## License

MIT
