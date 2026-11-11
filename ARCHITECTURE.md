# NestCare — Architecture & Design

## 1. Overview

NestCare is a role-based home-services application for customers, workers and administrators. The React frontend talks only to an API gateway; the gateway forwards requests to four separate Express services.

## 2. Component layout

```text
React + Vite frontend
        |
        v
API Gateway :4000
        |
        +--> Authentication service :4001
        |      - register / login / current user
        |      - user and worker profiles
        |
        +--> Requests service :4002
        |      - request creation and role-scoped lists
        |      - worker assignment and status workflow
        |      - emits lifecycle notifications
        |
        +--> Service catalogue :4003
        |      - browse and administer available services
        |
        +--> Notifications service :4004
               - in-app notifications
               - read/unread state
```

The internal services bind to `127.0.0.1`; the frontend uses the gateway URL only. Ports can be changed through `backend/.env`.

## 3. Local persistence

The demo stores named collections in one shared SQLite database at `backend/data/nestcare.sqlite`:

- `users`: user and professional profiles, with bcrypt password hashes
- `requests`: customer requests, assignments and status histories
- `services`: service catalogue entries
- `notifications`: lifecycle notifications

Each microservice opens the same database through the shared storage module. On first use, that module imports the corresponding JSON seed file from `backend/data/`; all subsequent reads and writes use SQLite. Set `NESTCARE_DB_PATH` in `backend/.env` to select another database file. Health checks verify both the service and its SQLite connection.

## 4. Authentication and authorisation

- Login returns a JWT; the browser keeps the session token and the non-secret profile in local storage.
- Passwords are hashed with bcrypt before being saved.
- Each API service validates the JWT and loads the current user profile before applying role checks.
- Customers see their own requests; workers see requests assigned to them or matching their specialisation when not yet assigned; administrators see all requests.
- Only administrators can add/remove worker profiles, assign requests or delete a request. Workers can update status only for matching jobs.

For production, move the token to a secure HTTP-only cookie, rotate secrets, rate-limit authentication and use HTTPS.

## 5. Request lifecycle

Allowed status flow is `Pending -> In Progress -> Completed`. An in-progress job may be returned to pending. Every status change is appended to `statusHistory`. New requests, assignments and status changes attempt to create notifications; notification delivery is best-effort so an unavailable notification service cannot roll back a saved request.

## 6. Run locally

1. Run `npm install` from the project root.
2. Copy `backend/.env.example` to `backend/.env` and change the JWT secret.
3. Run `npm run dev:all`.
4. Open the Vite URL printed in the terminal.
5. Check `http://127.0.0.1:4000/api/health` to confirm all services are responding.

See `README.md` for demo accounts and endpoint details.
