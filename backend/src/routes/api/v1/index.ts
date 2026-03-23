import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateApiKey } from '../../../middleware/apiKeyAuthV1';
import { rateLimit } from '../../../utils/rateLimiter';
import authRoutes from './auth';
import projectRoutes from './projects';
import feedbackRoutes from './feedback';
import webhookRoutes from './webhooks';

const router = Router();

// Serve OpenAPI spec
router.get('/openapi.json', (_req, res) => {
  const specPath = path.join(__dirname, 'openapi.json');
  // In dev mode, try source dir
  const devSpecPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'routes', 'api', 'v1', 'openapi.json');
  const finalPath = fs.existsSync(specPath) ? specPath : devSpecPath;
  if (fs.existsSync(finalPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(finalPath);
  } else {
    res.status(404).json({ error: 'OpenAPI spec not found' });
  }
});

// Auth/key management uses JWT auth (handled internally in auth routes)
router.use('/auth', authRoutes);

// All other v1 endpoints use API key auth + rate limiting
router.use(authenticateApiKey, rateLimit as any);

// Projects (GET /api/v1/projects, GET /api/v1/projects/:id, GET /api/v1/projects/:id/rounds)
router.use('/projects', projectRoutes);

// Feedback routes (mounted at root since they have mixed prefixes)
// GET/POST /api/v1/projects/:projectId/feedback
// GET/PATCH/DELETE /api/v1/feedback/:feedbackId
router.use('/', feedbackRoutes);

// Webhooks (POST/GET /api/v1/webhooks, PATCH/DELETE/POST /api/v1/webhooks/:id)
router.use('/webhooks', webhookRoutes);

export default router;
