import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export interface ApiKeyRequest extends Request {
  projectId?: string;
}

export async function validateApiKey(req: ApiKeyRequest, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers['x-api-key'] as string;
  if (!apiKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  try {
    const result = await query('SELECT id FROM projects WHERE api_key = $1', [apiKey]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    req.projectId = result.rows[0].id;
    next();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
