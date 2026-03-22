import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { pool } from './config/database';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import feedbackRoutes from './routes/feedback';
import exportRoutes from './routes/export';
import subscriptionRoutes from './routes/subscription';
import fs from 'fs';
import path from 'path';

const app = express();

// Serve static files
const publicPath = path.join(__dirname, '../public');
console.log('__dirname:', __dirname);
console.log('publicPath:', publicPath);
console.log('public/embed.js exists:', fs.existsSync(path.join(publicPath, 'embed.js')));
app.use(express.static(publicPath));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS: Allow any origin for the public embed endpoint (Webflow sites can use custom domains)
app.use('/feedback', cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'X-API-Key'],
}));
app.use(cors({
  origin: [env.frontendUrl],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/projects', exportRoutes);
app.use('/subscription', subscriptionRoutes);

// Feedback list is under /projects/:projectId/feedback (defined in feedback routes)
app.use('/', feedbackRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database schema
async function initDb() {
  try {
    const schemaPath = path.join(__dirname, 'config', 'schema.sql');
    // In development, try to find schema.sql relative to source
    const devSchemaPath = path.join(__dirname, '..', 'src', 'config', 'schema.sql');
    const sqlPath = fs.existsSync(schemaPath) ? schemaPath : devSchemaPath;

    if (fs.existsSync(sqlPath)) {
      const schema = fs.readFileSync(sqlPath, 'utf-8');
      await pool.query(schema);
      console.log('Database schema initialized');
    } else {
      console.warn('Schema file not found, skipping auto-migration');
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Start server
async function start() {
  await initDb();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
  });
}

start();

export default app;
