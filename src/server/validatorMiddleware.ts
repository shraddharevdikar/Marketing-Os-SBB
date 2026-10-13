import { Request, Response, NextFunction } from "express";

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Standard email format regex adhering to RFC 5322 principles
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Sanitizes raw string input against null bytes and control characters
 */
export function sanitizeInputString(val: unknown, maxLength: number = 10000): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/\0/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates generic AI Prompt requests
 */
export function validateAiPromptInput(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationErrorDetail[] = [];
  const { prompt } = req.body;

  if (prompt === undefined || prompt === null || typeof prompt !== "string") {
    errors.push({ field: "prompt", message: "Field 'prompt' is required and must be a string." });
  } else {
    const trimmed = prompt.trim();
    if (trimmed.length === 0) {
      errors.push({ field: "prompt", message: "Field 'prompt' cannot be empty." });
    } else if (trimmed.length > 30000) {
      errors.push({ field: "prompt", message: "Field 'prompt' exceeds maximum permissible length (30,000 characters)." });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Input validation failed. Please correct the specified fields.",
      details: errors
    });
  }

  req.body.prompt = sanitizeInputString(prompt, 30000);
  next();
}

/**
 * Validates Lead Capture payloads
 */
export function validateLeadCaptureInput(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationErrorDetail[] = [];
  const { name, email, source, territory, product, organizationId } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push({ field: "name", message: "Field 'name' is required and must be a non-empty string." });
  } else if (name.length > 150) {
    errors.push({ field: "name", message: "Field 'name' cannot exceed 150 characters." });
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push({ field: "email", message: "Field 'email' is required." });
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: "email", message: "Field 'email' must be a valid email address." });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Lead capture validation failed.",
      details: errors
    });
  }

  req.body.name = sanitizeInputString(name, 150);
  req.body.email = sanitizeInputString(email, 254).toLowerCase();
  if (source) req.body.source = sanitizeInputString(source, 100);
  if (territory) req.body.territory = sanitizeInputString(territory, 100);
  if (product) req.body.product = sanitizeInputString(product, 150);
  if (organizationId) req.body.organizationId = sanitizeInputString(organizationId, 100).toLowerCase().replace(/[^a-z0-9_-]/g, "_");

  next();
}

/**
 * Validates Campaign Creation and Proposal payloads
 */
export function validateCampaignInput(req: Request, res: Response, next: NextFunction) {
  const errors: ValidationErrorDetail[] = [];
  const { title, budget, channels } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    errors.push({ field: "title", message: "Campaign 'title' is required and must be a non-empty string." });
  } else if (title.length > 200) {
    errors.push({ field: "title", message: "Campaign 'title' cannot exceed 200 characters." });
  }

  if (budget !== undefined && budget !== null) {
    const numBudget = Number(budget);
    if (!Number.isFinite(numBudget) || numBudget < 0) {
      errors.push({ field: "budget", message: "Campaign 'budget' must be a non-negative finite number." });
    }
  }

  if (channels !== undefined && channels !== null) {
    if (!Array.isArray(channels)) {
      errors.push({ field: "channels", message: "Campaign 'channels' must be an array of strings." });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Campaign parameters validation failed.",
      details: errors
    });
  }

  req.body.title = sanitizeInputString(title, 200);
  next();
}
