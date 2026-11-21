import { GoogleGenAI } from '@google/genai';

let _clientInstance: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  if (!_clientInstance) {
    _clientInstance = new GoogleGenAI({ apiKey });
  }

  return _clientInstance;
}

export function getGeminiModelId(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
}
