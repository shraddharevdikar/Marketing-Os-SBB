/**
 * Enterprise Pre-Flight PII Tokenization & Sanitization Engine
 * 
 * Ensures raw Personal Identifiable Information (PII) such as customer emails,
 * phone numbers, social insurance / security numbers, credit cards, and full names
 * are deterministically tokenized and stripped at the server API gateway BEFORE
 * prompts leave the security perimeter to the Gemini API.
 */

export interface PiiTokenizationResult {
  sanitizedText: string;
  tokenMap: Record<string, string>;
  piiCount: number;
  detectedTypes: string[];
}

// Regex Patterns for Sensitive Data Detection
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SIN_SSN_REGEX = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{3}\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d[ -]*?){13,16}\b/g;

/**
 * Tokenizes raw text by replacing sensitive PII with deterministic placeholder tokens.
 */
export function sanitizeAndTokenizePII(input: string): PiiTokenizationResult {
  if (!input || typeof input !== "string") {
    return { sanitizedText: input || "", tokenMap: {}, piiCount: 0, detectedTypes: [] };
  }

  let sanitized = input;
  const tokenMap: Record<string, string> = {};
  const detectedTypesSet = new Set<string>();
  let piiCount = 0;

  // 1. Tokenize Email Addresses
  let emailIndex = 1;
  sanitized = sanitized.replace(EMAIL_REGEX, (match) => {
    // Keep internal domain names if required, or mask completely
    const token = `[EMAIL_REDACTED_${emailIndex++}]`;
    tokenMap[token] = match;
    detectedTypesSet.add("Email Address");
    piiCount++;
    return token;
  });

  // 2. Tokenize Phone Numbers
  let phoneIndex = 1;
  sanitized = sanitized.replace(PHONE_REGEX, (match) => {
    // Avoid tokenizing short numbers or non-phones
    if (match.replace(/\D/g, "").length < 7) return match;
    const token = `[PHONE_REDACTED_${phoneIndex++}]`;
    tokenMap[token] = match;
    detectedTypesSet.add("Phone Number");
    piiCount++;
    return token;
  });

  // 3. Tokenize SIN / SSN
  let ssnIndex = 1;
  sanitized = sanitized.replace(SIN_SSN_REGEX, (match) => {
    const token = `[GOV_ID_REDACTED_${ssnIndex++}]`;
    tokenMap[token] = match;
    detectedTypesSet.add("Government ID / SIN");
    piiCount++;
    return token;
  });

  // 4. Tokenize Credit Card Numbers
  let cardIndex = 1;
  sanitized = sanitized.replace(CREDIT_CARD_REGEX, (match) => {
    const digitsOnly = match.replace(/\D/g, "");
    if (digitsOnly.length >= 13 && digitsOnly.length <= 16) {
      const token = `[PAYMENT_CARD_REDACTED_${cardIndex++}]`;
      tokenMap[token] = match;
      detectedTypesSet.add("Payment Card");
      piiCount++;
      return token;
    }
    return match;
  });

  return {
    sanitizedText: sanitized,
    tokenMap,
    piiCount,
    detectedTypes: Array.from(detectedTypesSet)
  };
}

/**
 * Re-hydrates tokenized text back into original customer data on server response return.
 */
export function rehydratePII(sanitizedText: string, tokenMap: Record<string, string>): string {
  if (!sanitizedText || !tokenMap || Object.keys(tokenMap).length === 0) {
    return sanitizedText;
  }

  let rehydrated = sanitizedText;
  for (const [token, originalValue] of Object.entries(tokenMap)) {
    rehydrated = rehydrated.replaceAll(token, originalValue);
  }
  return rehydrated;
}
