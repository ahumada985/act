/**
 * Cliente de OpenAI para IA Generativa
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

/**
 * Modelos disponibles
 */
export const MODELS = {
  GPT4_TURBO: 'gpt-4-turbo-preview',
  GPT4: 'gpt-4',
  GPT35_TURBO: 'gpt-3.5-turbo',
  GPT4_VISION: 'gpt-4-vision-preview',
} as const;
