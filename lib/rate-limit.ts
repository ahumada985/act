/**
 * Sistema de Rate Limiting para proteger APIs costosas
 * CRÍTICO: Previene DoS y abuso de APIs de IA
 */

import { NextRequest } from 'next/server';

// Simple in-memory rate limiter (para desarrollo)
// En producción, usar Redis con @upstash/ratelimit

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const store: RateLimitStore = {};

// Limpiar entradas expiradas cada 1 minuto
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  });
}, 60000);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS = {
  AI: { maxRequests: 5, windowMs: 60000 }, // 5 requests por minuto
  API: { maxRequests: 60, windowMs: 60000 }, // 60 requests por minuto
  AUTH: { maxRequests: 5, windowMs: 900000 }, // 5 intentos por 15 minutos
  CRON: { maxRequests: 1, windowMs: 3600000 }, // 1 por hora
};

/**
 * Verifica si una request excede el rate limit
 */
export async function checkRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = 'API'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const config = RATE_LIMITS[type];
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'anonymous';

  const key = `${type}:${ip}`;
  const now = Date.now();

  // Obtener o crear entrada
  let entry = store[key];

  if (!entry || entry.resetAt < now) {
    // Nueva ventana de tiempo
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    store[key] = entry;
  }

  // Incrementar contador
  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const success = entry.count <= config.maxRequests;

  return {
    success,
    limit: config.maxRequests,
    remaining,
    reset: entry.resetAt,
  };
}

/**
 * Middleware helper para rate limiting
 */
export async function withRateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS,
  handler: () => Promise<Response>
): Promise<Response> {
  const { success, limit, remaining, reset } = await checkRateLimit(request, type);

  if (!success) {
    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': reset.toString(),
      'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
    });

    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Ejecutar handler y agregar headers de rate limit
  const response = await handler();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}

/**
 * Para producción: Usar Upstash Redis
 *
 * Ejemplo de uso con Upstash:
 *
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { Redis } from '@upstash/redis';
 *
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL!,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 * });
 *
 * export const aiRateLimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(5, '1 m'),
 *   analytics: true,
 * });
 *
 * // Uso en endpoint:
 * const { success } = await aiRateLimit.limit(ip);
 * if (!success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
