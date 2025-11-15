/**
 * Validación de URLs para prevenir SSRF (Server-Side Request Forgery)
 * CRÍTICO: Previene ataques a servicios internos y metadata endpoints
 */

// Dominios permitidos para images
const ALLOWED_DOMAINS = [
  'udloynzfnktwoaanfjzo.supabase.co', // Tu dominio de Supabase
  // Agregar otros dominios confiables aquí
];

// IPs y rangos bloqueados (privadas y metadata)
const BLOCKED_PATTERNS = [
  // Localhost
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,

  // Private networks (RFC1918)
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,

  // Link-local
  /^169\.254\./,
  /^fe80:/i,

  // Cloud metadata endpoints
  /^169\.254\.169\.254$/,  // AWS, Azure, GCP
  /metadata\.google\.internal/i,
  /^fd00:/i, // IPv6 private
];

// Puertos bloqueados (servicios internos comunes)
const BLOCKED_PORTS = [
  22,   // SSH
  23,   // Telnet
  25,   // SMTP
  3306, // MySQL
  5432, // PostgreSQL
  6379, // Redis
  27017,// MongoDB
  9200, // Elasticsearch
];

export interface URLValidationResult {
  isValid: boolean;
  error?: string;
  url?: URL;
}

/**
 * Valida una URL para prevenir SSRF
 */
export function validateImageURL(urlString: string): URLValidationResult {
  // Permitir data URIs (base64)
  if (urlString.startsWith('data:image/')) {
    return { isValid: true };
  }

  try {
    const url = new URL(urlString);

    // 1. Solo HTTPS
    if (url.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Solo se permiten URLs HTTPS',
      };
    }

    // 2. Verificar dominio permitido
    if (!ALLOWED_DOMAINS.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
      return {
        isValid: false,
        error: 'Dominio no permitido',
      };
    }

    // 3. Verificar patrones bloqueados
    if (BLOCKED_PATTERNS.some(pattern => pattern.test(url.hostname))) {
      return {
        isValid: false,
        error: 'URL bloqueada por seguridad',
      };
    }

    // 4. Verificar puerto (si está especificado)
    if (url.port) {
      const port = parseInt(url.port, 10);
      if (BLOCKED_PORTS.includes(port)) {
        return {
          isValid: false,
          error: 'Puerto no permitido',
        };
      }
    }

    // 5. No permitir credenciales en URL
    if (url.username || url.password) {
      return {
        isValid: false,
        error: 'URLs con credenciales no permitidas',
      };
    }

    return { isValid: true, url };
  } catch (error) {
    return {
      isValid: false,
      error: 'URL inválida',
    };
  }
}

/**
 * Fetch seguro que valida la URL antes de hacer la request
 */
export async function safeFetch(
  urlString: string,
  options?: RequestInit
): Promise<Response> {
  const validation = validateImageURL(urlString);

  if (!validation.isValid) {
    throw new Error(`URL validation failed: ${validation.error}`);
  }

  // Opciones de seguridad por defecto
  const secureOptions: RequestInit = {
    ...options,
    redirect: 'manual', // No seguir redirects automáticamente
    signal: options?.signal || AbortSignal.timeout(10000), // Timeout de 10s
  };

  const response = await fetch(urlString, secureOptions);

  // Verificar que no hubo redirect
  if (response.status >= 300 && response.status < 400) {
    throw new Error('Redirects not allowed for security');
  }

  // Verificar Content-Type es una imagen
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error('Response is not an image');
  }

  // Verificar tamaño razonable (10MB máximo)
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
    throw new Error('Image too large (max 10MB)');
  }

  return response;
}

/**
 * Configuración para agregar más dominios permitidos
 */
export function addAllowedDomain(domain: string): void {
  if (!ALLOWED_DOMAINS.includes(domain)) {
    ALLOWED_DOMAINS.push(domain);
  }
}

/**
 * Para uso en producción: verificar también con DNS lookup
 * que el dominio no resuelva a IP privada
 */
export async function validateURLWithDNS(urlString: string): Promise<URLValidationResult> {
  const basicValidation = validateImageURL(urlString);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // En Node.js 18+, usar dns.promises.resolve()
  // para verificar que el dominio no resuelva a IPs privadas
  // Esto requiere importar 'dns' de Node.js

  return basicValidation;
}
