-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username     VARCHAR(50)  UNIQUE NOT NULL,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  full_name    VARCHAR(100),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── REFRESH TOKENS ──────────────────────────────────────────
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        UNIQUE NOT NULL,
  is_revoked  BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROJECTS ────────────────────────────────────────────────
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  status      VARCHAR(20)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'archived', 'completed')),
  owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── PROJECT MEMBERS ─────────────────────────────────────────
CREATE TABLE project_members (
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL DEFAULT 'viewer'
                CHECK (role IN ('owner', 'contributor', 'viewer')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- ─── SPRINTS ─────────────────────────────────────────────────
CREATE TABLE sprints (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  goal        VARCHAR(500),
  status      VARCHAR(20)  NOT NULL DEFAULT 'planning'
                CHECK (status IN ('planning', 'active', 'completed')),
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── TASKS ───────────────────────────────────────────────────
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id   UUID                 REFERENCES sprints(id)  ON DELETE SET NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(20)  NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in_progress', 'done')),
  priority    VARCHAR(20)  NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date    DATE,
  created_by  UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── TASK ASSIGNEES ──────────────────────────────────────────
CREATE TABLE task_assignees (
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);

-- ─── LABELS ──────────────────────────────────────────────────
CREATE TABLE labels (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(50)  NOT NULL,
  color       VARCHAR(7)   NOT NULL DEFAULT '#6B7280',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── TASK LABELS ─────────────────────────────────────────────
CREATE TABLE task_labels (
  task_id     UUID NOT NULL REFERENCES tasks(id)   ON DELETE CASCADE,
  label_id    UUID NOT NULL REFERENCES labels(id)  ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- ─── COMMENTS ────────────────────────────────────────────────
CREATE TABLE comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id     UUID        NOT NULL REFERENCES tasks(id)    ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  parent_id   UUID                 REFERENCES comments(id) ON DELETE CASCADE,
  content     VARCHAR(2000) NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  link        TEXT,
  is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ACTIVITY LOGS ───────────────────────────────────────────
CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  action      VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_tasks_project_id      ON tasks(project_id);
CREATE INDEX idx_tasks_sprint_id       ON tasks(sprint_id);
CREATE INDEX idx_tasks_status          ON tasks(status);
CREATE INDEX idx_sprints_project_id    ON sprints(project_id);
CREATE INDEX idx_comments_task_id      ON comments(task_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_project ON activity_logs(project_id);
CREATE INDEX idx_refresh_tokens_user   ON refresh_tokens(user_id);