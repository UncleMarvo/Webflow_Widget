import { Response } from 'express';

export type ApiErrorCode =
  | 'INVALID_API_KEY'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'RESOURCE_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

const STATUS_MAP: Record<ApiErrorCode, number> = {
  INVALID_API_KEY: 401,
  INSUFFICIENT_PERMISSIONS: 403,
  RESOURCE_NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
};

export function apiError(
  res: Response,
  code: ApiErrorCode,
  message: string,
  details?: Record<string, string> | null
): void {
  res.status(STATUS_MAP[code]).json({
    error: {
      code,
      message,
      details: details || null,
    },
  });
}

export function validationError(res: Response, fields: Record<string, string>): void {
  apiError(res, 'VALIDATION_ERROR', 'Validation failed', fields);
}
