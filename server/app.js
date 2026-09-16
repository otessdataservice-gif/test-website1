const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Render sits behind a proxy; this makes req.ip correct for rate limiting.
app.set('trust proxy', 1);

app.use(helmet());

/**
 * CORS.
 *
 * When everything is one service the browser is already on this origin, but it
 * still sends an Origin header for some requests (Vite marks its module script
 * and stylesheet `crossorigin`), so same origin has to be allowed explicitly.
 * Anything else has to be listed in CLIENT_URL, which is only needed when the
 * frontend is hosted separately.
 *
 * A disallowed origin gets no CORS header, so the browser blocks it. It is not
 * turned into a 500: an origin check failing is not a server fault.
 */
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors((req, callback) => {
    const origin = req.headers.origin;

    // No Origin header: same origin navigation, curl, server to server.
    if (!origin) return callback(null, { origin: true });

    let originHost = null;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }

    const isSameOrigin = Boolean(originHost) && originHost === req.headers.host;
    const isAllowed = isSameOrigin || allowedOrigins.includes(origin);

    callback(null, {
      origin: isAllowed,
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
  })
);

app.use(express.json({ limit: '100kb' }));

// Broad ceiling on the whole API. Auth routes have a tighter limit of their own.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please slow down' },
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'TaskFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// An unknown /api path is a JSON 404, never the React page.
app.use('/api', notFound);

/**
 * Single service hosting: if the client has been built, this same server also
 * serves the React bundle, so the frontend and the API share one origin (and
 * one Render web service). Without a build it stays API only, which is what
 * happens in development, where Vite serves the frontend on port 5173.
 */
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const hasClientBuild = fs.existsSync(path.join(clientDist, 'index.html'));

if (hasClientBuild) {
  // Hashed asset filenames, so they can be cached hard. index.html must not be.
  app.use(
    express.static(clientDist, {
      index: false,
      maxAge: '1y',
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
      },
    })
  );

  // React Router owns the rest: deep links such as /dashboard get index.html.
  // It must never be cached, or a deploy leaves browsers pointing at old assets.
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.use(notFound);
}

app.use(errorHandler);

module.exports = app;
