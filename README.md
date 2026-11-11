# NestCare — Home Services Platform

NestCare is a local-development home-services platform built with **React + Vite** on the frontend and **Node.js + Express microservices** on the backend. Customers can browse services, submit and follow repair requests; workers can manage their matching jobs; administrators can manage workers, assign jobs, and update request progress.

## What is included

- Modern responsive landing page, service directory, sign-in and registration pages.
- Role-aware workspaces for customers, workers and administrators.
- Booking form with service category, location, description, preferred date/time and standard/urgent priority.
- Search and filters for requests and professionals.
- Admin worker CRUD, request status tracking and worker assignment.
- Notification service for new requests, job assignments and status changes.
- Local SQLite persistence in `backend/data/nestcare.sqlite`; the included JSON files are imported as seed data on first use, so no cloud database is required.
- JWT authentication, bcrypt password hashing and role checks in the services.

## Architecture

The frontend calls one public API gateway at `http://127.0.0.1:4000`. The gateway forwards API calls to four internal services, each listening only on `127.0.0.1`:

| Component | Port | Responsibility |
| --- | ---: | --- |
| API gateway | 4000 | Single API entry point and service proxy |
| Authentication service | 4001 | Login, registration, users and worker profiles |
| Requests service | 4002 | Request creation, visibility, assignments and status workflow |
| Service catalogue | 4003 | Home-service catalogue |
| Notifications service | 4004 | In-app notifications and read/unread state |

Data is persisted in a local SQLite file at `backend/data/nestcare.sqlite`. On first launch, the users, requests and services seed files in `backend/data/` are imported automatically; notifications start empty. The services use a small collection-based SQLite adapter suited to a coursework/local demo, not a high-concurrency production deployment. To reset demo data, stop the app and remove `backend/data/nestcare.sqlite` plus any `nestcare.sqlite-wal` / `nestcare.sqlite-shm` files; the seed JSON files will be imported again on next launch. For production use, consider PostgreSQL, rate limiting, HTTPS, managed secrets, audit logging and a durable notification queue.

All backend services use the same SQLite path. Set the optional `NESTCARE_DB_PATH` in `backend/.env` to move it; relative paths resolve from the project root. Each service health check verifies SQLite, and the gateway reports a healthy state only when every service and its database connection are ready.

## Requirements

- Node.js 22.5.0 or newer (the project uses Node’s built-in `node:sqlite` module).
- npm.
- No separate database installation is required; SQLite is provided by Node.js.

## Setup

Open a terminal in the project root — the folder containing `package.json` — then run:

```bash
npm install
```

Create `backend/.env` from the example file:

**Windows PowerShell**

```powershell
Copy-Item backend/.env.example backend/.env
```

**macOS/Linux**

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and change `JWT_SECRET` to a long random value. The example/default secret is only for local development.

### Start everything in one terminal

```bash
npm run dev:all
```

This starts the four internal services, the API gateway and Vite. Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

You can also run the frontend and backend separately:

Terminal 1:

```bash
npm run dev:services
```

Terminal 2:

```bash
npm run dev
```

Keep the service terminal running while using the app. Check the service health at `http://127.0.0.1:4000/api/health`.

## Demo accounts

The auth service seeds these accounts when missing. Use them for local testing only:

| Role | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `admin123` |
| Customer | `user` | `user123` |
| Electrician | `worker` | `worker123` |
| Plumber | `plumber` | `worker123` |
| Carpenter | `carpenter` | `worker123` |
| Cleaner | `cleaner` | `worker123` |
| General maintenance | `handyman` | `worker123` |

New user registration requires a password of at least 8 characters. Demo credentials should be replaced before any public deployment.

## Main API routes

- `POST /api/auth/register` — customer registration
- `POST /api/auth/login` — sign-in and token response
- `GET /api/auth/me` — current signed-in user
- `GET/POST /api/users` — administrator user/worker management
- `GET /api/workers` — professional directory for signed-in users
- `GET/POST /api/services` — service catalogue
- `GET/POST /api/requests` — list/create requests (role-scoped)
- `PATCH/DELETE /api/requests/:id` — update request/assignment or delete (role-restricted)
- `GET /api/notifications` — current user's notification list
- `PATCH /api/notifications/:id/read` — mark one notification read
- `PATCH /api/notifications/read-all` — mark all visible notifications read
- `GET /api/health` — gateway and internal-service health summary

## Tests

```bash
npm test
npm run build
```

The included tests cover the request status state machine. A successful build requires installing the npm dependencies for your operating system; do not copy the ZIP's `node_modules` directory across operating systems.
