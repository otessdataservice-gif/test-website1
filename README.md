# TaskFlow

A personal task manager built as a full-stack demonstration: React and Vite on the front, Express and
MongoDB behind it, JWT authentication in between. Register, log in, and keep a task list that only
you can see.

Every part of it works. The frontend talks to a real API, the API stores real documents in MongoDB,
passwords are hashed with bcrypt, and the server checks task ownership on every request.

---

## Features

- Register, log in, log out with JWT authentication
- Protected dashboard: signed out visitors are sent to the login page
- Create, read, edit and delete tasks
- Mark a task complete, and mark a completed task active again
- Filter by All, Active and Completed
- Task statistics: total, completed, pending
- Light and dark mode with a toggle that persists across refreshes
- Responsive from phone to desktop
- Toast feedback, loading states and disabled buttons during requests
- Task ownership enforced on the server, not just hidden in the UI

---

## Technology stack

| Layer    | Choice                                        |
| -------- | --------------------------------------------- |
| Frontend | React 18, Vite, React Router, Tailwind CSS     |
| Backend  | Node.js, Express 4                             |
| Database | MongoDB with Mongoose                          |
| Auth     | JSON Web Tokens, bcryptjs                      |
| Security | helmet, cors, express-rate-limit               |
| Hosting  | Render (static site plus web service)          |

JavaScript throughout, no TypeScript. No state management library: React context plus one hook is
enough at this size.

---

## Architecture

```
React / Vite  (browser)
      |
      |  fetch with Authorization: Bearer <jwt>
      v
Express API   (Node)
      |
      |  Mongoose
      v
MongoDB
```

The frontend is a static bundle. It holds a JWT in localStorage and sends it on every API call. The
API verifies that token, loads the user it belongs to, and scopes every task query to that user.

In production these run as **one service**: Express serves the built React app from `client/dist` and
the API under `/api`, on the same port and the same origin. In development they are split, with Vite
on 5173 for hot reload and the API on 5000.

Request path for a protected route:

```
request -> helmet -> cors -> json parser -> rate limiter
        -> protect (verify JWT, load user)
        -> controller (validate input, check ownership)
        -> Mongoose -> MongoDB
        -> { success, data }   or   error handler -> { success, message }
```

---

## Folder structure

```
.
├── package.json             build and start scripts Render runs
├── client/                  React frontend
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── theme.js         applies the saved theme before first paint
│   │   └── _redirects       SPA fallback, only used for static hosting
│   ├── src/
│   │   ├── components/      Header, TaskCard, Modal, ConfirmDialog, ...
│   │   ├── context/         AuthContext, ThemeContext, ToastContext
│   │   ├── hooks/           useTasks
│   │   ├── pages/           Landing, Login, Register, Dashboard, Legal, NotFound
│   │   ├── services/        api.js, the only place fetch is called
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/                  Express API
│   ├── config/db.js         MongoDB connection
│   ├── controllers/         authController.js, taskController.js
│   ├── middleware/          auth.js, errorHandler.js
│   ├── models/              User.js, Task.js
│   ├── routes/              authRoutes.js, taskRoutes.js
│   ├── scripts/             devMemoryDb.js, run without installing MongoDB
│   ├── tests/api.test.js    end to end API tests
│   ├── utils/               ApiError.js, asyncHandler.js
│   ├── app.js               express app, middleware and routes
│   ├── server.js            connects to MongoDB, then listens
│   └── .env.example
│
├── render.yaml              optional Render blueprint
├── .gitignore
└── README.md
```

---

## Installation

You need Node.js 18 or newer.

```bash
# backend
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env

# frontend
cd ../client
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

---

## Environment variables

### server/.env

| Variable         | Required | What it is                                                     |
| ---------------- | -------- | -------------------------------------------------------------- |
| `PORT`           | no       | Port to listen on. Render sets this itself. Defaults to 5000.    |
| `NODE_ENV`       | no       | `development` locally, `production` on Render.                   |
| `MONGODB_URI`    | yes      | MongoDB connection string. The server refuses to start without it. |
| `JWT_SECRET`     | yes      | Long random string used to sign tokens. The server exits if it is missing. |
| `JWT_EXPIRES_IN` | no       | Token lifetime. Defaults to `7d`.                                |
| `CLIENT_URL`     | no       | Extra origin allowed by CORS, comma separate for several. Only needed when the frontend is hosted separately: same-origin requests are always allowed. Defaults to `http://localhost:5173` for the Vite dev server. |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### client/.env

Optional. Leave it out entirely for both local development and single service hosting.

| Variable       | Required | What it is                                              |
| -------------- | -------- | ------------------------------------------------------- |
| `VITE_API_URL` | no       | Base URL of the API. Unset means `http://localhost:5000` in `npm run dev`, and the same origin in a production build. Set it only when the frontend is hosted separately from the API. |

Anything prefixed with `VITE_` ends up in the browser bundle, so it is public. Never put
`MONGODB_URI` or `JWT_SECRET` in the client env file.

---

## MongoDB setup

Pick one of these.

**MongoDB Atlas (what you want for Render).** Create a free cluster, add a database user, and under
Network Access allow `0.0.0.0/0` so Render can reach it. Copy the connection string and set:

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
```

**Local MongoDB.** Install MongoDB Community Server and use:

```
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
```

**Neither, just to try it out.** The backend can run against a throwaway in-memory MongoDB:

```bash
cd server
npm run dev:memory
```

Data disappears when you stop the process. Useful for a demo, not for anything you want to keep.

Collections (`users`, `tasks`) are created automatically on first write.

---

## Running it

Two terminals.

```bash
# terminal 1: API on http://localhost:5000
cd server
npm run dev          # or: npm run dev:memory

# terminal 2: frontend on http://localhost:5173
cd client
npm run dev
```

Open http://localhost:5173, create an account, and add a task.

To run it the way Render will, as a single service on one port:

```bash
npm run build      # from the repo root: installs both, builds the client
npm start          # everything on http://localhost:5000
```

Run the API test suite (starts its own in-memory MongoDB, needs no configuration):

```bash
cd server
npm run test:api
```

---

## API endpoints

Base URL: `/api`. All responses are JSON.

Success:

```json
{ "success": true, "data": { } }
```

Error:

```json
{ "success": false, "message": "Task not found" }
```

### Public

| Method | Path                 | Body                        | Returns                |
| ------ | -------------------- | --------------------------- | ---------------------- |
| GET    | `/api/health`        |                             | service status         |
| POST   | `/api/auth/register` | `name`, `email`, `password` | `user`, `token` (201)  |
| POST   | `/api/auth/login`    | `email`, `password`         | `user`, `token`        |

### Authenticated (send `Authorization: Bearer <token>`)

| Method | Path                     | Body                              | Returns          |
| ------ | ------------------------ | --------------------------------- | ---------------- |
| GET    | `/api/auth/me`           |                                   | `user`           |
| GET    | `/api/tasks`             |                                   | `tasks`, newest first |
| POST   | `/api/tasks`             | `title`, `description` (optional) | `task` (201)     |
| GET    | `/api/tasks/:id`         |                                   | `task`           |
| PUT    | `/api/tasks/:id`         | `title`, `description`            | `task`           |
| PATCH  | `/api/tasks/:id/toggle`  |                                   | `task`           |
| DELETE | `/api/tasks/:id`         |                                   | `id`             |

Status codes: 400 invalid input or malformed id, 401 missing, invalid or expired token, 404 task not
found or not yours, 409 email already registered, 429 rate limited.

Quick check with curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ama","email":"ama@example.com","password":"password123"}'

curl http://localhost:5000/api/tasks -H "Authorization: Bearer PASTE_TOKEN_HERE"
```

---

## Security considerations

What is implemented:

- **Password hashing.** bcryptjs with a generated salt, in a Mongoose pre-save hook. The plain
  password is never stored or logged.
- **Hashes never leave the server.** The `password` field is `select: false` and is stripped in
  `toJSON`; controllers return a hand-built user object.
- **Secrets in environment variables.** `JWT_SECRET` and `MONGODB_URI` are never hardcoded, and the
  server exits at startup if `JWT_SECRET` is missing.
- **JWT verification on every protected route.** The middleware extracts the bearer token, verifies
  the signature, loads the user from the id inside the token, and rejects anything invalid or expired
  with 401.
- **Authorization, not just authentication.** The user id always comes from the token. Task queries
  are scoped with `{ _id, user }`, so another account's id returns 404 on read, update, toggle and
  delete. A `user` field sent in a request body is ignored.
- **Input validation on the server.** Name, email format, password length, title presence and field
  lengths are all checked in the API, whatever the frontend did.
- **Malformed ids handled.** `mongoose.isValidObjectId` gives a clean 400 instead of a cast crash.
- **helmet** for security headers, **cors** limited to `CLIENT_URL`, and **express-rate-limit**: 20
  requests per 15 minutes on auth routes, 300 across the rest of the API.
- **Clean errors.** One error handler formats every failure. In production, 500s return a generic
  message so stack traces, driver output and connection strings never reach a client.
- **Login does not enumerate accounts.** A wrong password and an unknown email return the same
  message.
- **`.env` is gitignored.**

What this is not: the token lives in localStorage, which is simple and works but is readable by any
script running on the page, so a serious app would use httpOnly cookies with CSRF protection. There
is no email verification, no password reset, no refresh token rotation, no account lockout, and no
audit logging. Good enough for a demonstration, not a claim that it is bulletproof.

---

## Render deployment

One web service hosts everything. The build compiles the React app into `client/dist`, and Express
serves those files alongside `/api`, so the frontend and the API share a single origin and a single
URL. No static site, no CORS setup, no second service to pay for.

Push this repository to GitHub, then either use `render.yaml` (New, Blueprint) or create the service
by hand:

| Setting            | Value                    |
| ------------------ | ------------------------ |
| Type               | Web Service              |
| Runtime            | Node                     |
| Root directory     | *(leave blank, the repo root)* |
| **Build command**  | `npm run build`          |
| **Start command**  | `npm start`              |
| Health check path  | `/api/health`            |

Environment variables:

```
NODE_ENV=production
MONGODB_URI=<your Atlas connection string>
JWT_SECRET=<long random string>
```

That is the whole list. `CLIENT_URL` and `VITE_API_URL` are not needed here: the browser is already
on the same origin as the API, and the server allows same-origin requests automatically.

Do not set `PORT`. Render provides it and the server reads `process.env.PORT`.

What the two commands do:

```
npm run build  ->  npm install in server/, npm install in client/, then vite build
npm start      ->  node server.js, which serves /api and client/dist
```

Deep links work: Express sends `index.html` for any path that is not `/api/...` or a built asset, so
refreshing `/dashboard` loads the app instead of a 404.

### Hosting the frontend separately instead

If you would rather run a static site plus a web service, the code supports it. Create the web
service with root directory `server`, build `npm install`, start `npm start`; create the static site
with root directory `client`, build `npm install && npm run build`, publish directory `dist`. Then
set `VITE_API_URL` on the static site to the API URL, and `CLIENT_URL` on the API to the static site
URL so CORS allows it. `client/public/_redirects` handles the SPA fallback there.

---

## Troubleshooting

**`MONGODB_URI is not set`** — no `.env` in `server/`, or it is missing that line. Copy
`.env.example` and fill it in.

**`JWT_SECRET is not set`, the server exits immediately** — same cause, add the variable.

**Blank page on Render, console says a script was blocked or failed** — usually a stale build. Clear
the build cache and redeploy. On a single service the frontend and API share an origin, so CORS is
not involved.

**CORS error, split hosting only** — `CLIENT_URL` on the API does not match the frontend origin
exactly. No trailing slash, and https not http.

**Every API call fails with "Cannot reach the server"** — on a single service, the API failed to
start, so check the Render logs for the MongoDB connection. On split hosting, `VITE_API_URL` is
wrong. Either way, free Render services sleep after inactivity and take about 30 seconds to wake up.

**Atlas connection times out** — the cluster's Network Access list does not include Render. Allow
`0.0.0.0/0`.

**401 on every request after a while** — the token expired, seven days by default. Log in again.

**Refreshing `/dashboard` gives a 404 on Render** — on a single service this means `client/dist` was
not built, so Express is running API only. Check that the build command is `npm run build` from the
repo root. On a static site, confirm `client/public/_redirects` was included in the build.

**429 Too many requests** — the auth rate limit, 20 per 15 minutes. Wait, or raise the limit in
`server/routes/authRoutes.js` while developing.

**Dark mode does not stick** — the browser is blocking localStorage, for example a private window
with site data disabled.
