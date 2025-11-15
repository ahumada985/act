/**
 * Cliente de Tesseract.js para OCR
 */

'use client';

import { createWorker, type Worker } from 'tesseract.js';

let worker: Worker | null = null;

/**
 * Inicializa el worker de Tesseract
 */
export async function initializeOCR() {
  if (worker) return worker;

  worker = await createWorker('spa'); // Español
  return worker;
}

/**
 * Extrae texto de una imagen
 */
export async function extractTextFromImage(
  imageUrl: string,
  options?: {
    lang?: string;
    tessedit_pageseg_mode?: number;
  }
): Promise<{
  text: string;
  confidence: number;
  words: any[];
}> {
  const w = await initializeOCR();

  if (options?.lang && options.lang !== 'spa') {
    await w.loadLanguage(options.lang);
    await w.initialize(options.lang);
  }

  if (options?.tessedit_pageseg_mode) {
    await w.setParameters({
      tessedit_pageseg_mode: options.tessedit_pageseg_mode,
    });
  }

  const result = await w.recognize(imageUrl);

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words,
  };
}

/**
 * Extrae números/códigos de una imagen (optimizado)
 */
export async function extractNumbers(imageUrl: string): Promise<string> {
  const w = await initializeOCR();

  // Modo optimizado para números
  await w.setParameters({
    tessedit_char_whitelist: '0123456789-.',
    tessedit_pageseg_mode: 6, // Uniform block of text
  });

  const result = await w.recognize(imageUrl);
  return result.data.text.trim();
}

/**
 * Extrae códigos alfanuméricos (para placas, series, etc.)
 */
export async function extractCodes(imageUrl: string): Promise<string[]> {
  const { text } = await extractTextFromImage(imageUrl);

  // Buscar patrones de códigos (ej: ABC-123, A1B2C3, etc.)
  const codePattern = /[A-Z0-9]{2,}[-]?[A-Z0-9]{2,}/g;
  const codes = text.match(codePattern) || [];

  return codes;
}

/**
 * Parsea texto extraído para encontrar campos específicos
 */
export function parseExtractedText(text: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  // Patrones comunes en documentos técnicos
  const patterns: Record<string, RegExp> = {
    ordenTrabajo: /(?:OT|Orden)[:\s]*([\w-]+)/i,
    serie: /(?:Serie|Serial|S\/N)[:\s]*([\w-]+)/i,
    modelo: /(?:Modelo|Model)[:\s]*([\w-]+)/i,
    codigo: /(?:Código|Code)[:\s]*([\w-]+)/i,
    fecha: /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/,
    placa: /[A-Z]{2,4}[-]?\d{3,4}/,
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      parsed[key] = match[1].trim();
    } else if (match && match[0] && key === 'fecha') {
      parsed[key] = match[0];
    }
  }

  return parsed;
}

/**
 * Termina el worker (limpieza)
 */
export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
