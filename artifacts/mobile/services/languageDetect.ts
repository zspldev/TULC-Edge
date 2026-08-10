import type { DetectedLanguage } from './aiTypes';

// Devanagari Unicode block: U+0900–U+097F
// Extended Devanagari: U+A8E0–U+A8FF
const DEVANAGARI_REGEX = /[\u0900-\u097F\uA8E0-\uA8FF]/;

/**
 * Detect the language of a text message.
 * Returns 'mr' if Devanagari characters are found (Marathi), 'en' otherwise.
 * Explicit overrides: "in marathi" / "in english" phrases.
 */
export function detectLanguage(text: string): DetectedLanguage {
  // Check for explicit English override
  const lower = text.toLowerCase();
  if (
    lower.includes('in english') ||
    lower.includes('explain in english') ||
    lower.includes('answer in english')
  ) {
    return 'en';
  }

  // Check for explicit Marathi override
  if (
    lower.includes('in marathi') ||
    lower.includes('marathi madhe') ||
    lower.includes('मराठी') ||
    lower.includes('मराठीत')
  ) {
    return 'mr';
  }

  // Detect Devanagari script
  if (DEVANAGARI_REGEX.test(text)) {
    return 'mr';
  }

  return 'en';
}

/**
 * Count how many Devanagari characters are in the text.
 * Useful for weighted detection in mixed-language messages.
 */
export function countDevanagariChars(text: string): number {
  return (text.match(/[\u0900-\u097F]/g) || []).length;
}
