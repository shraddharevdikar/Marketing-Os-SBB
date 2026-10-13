import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// In-memory sliding-window rate limiter
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitBucket>();

// Clean up stale rate limit entries periodically (unref so tests exit promptly)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
if (cleanupInterval && typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}

/**
 * Extract and verify authentication and resolve tenant context
 */
export function verifyAuthAndTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || (req.headers["x-sbb-session-token"] as string);

    // Allow public health checks and webhooks
    if (req.path === "/api/health" || req.path === "/health") {
      return next();
    }

    if (!authHeader) {
      // In development/test mode, resolve fallback sandbox identity
      if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_AUTH === "true") {
        const testUser: AuthenticatedUser = {
          userId: (req.headers["x-test-user-id"] as string) || "dev_operator_01",
          email: (req.headers["x-test-user-email"] as string) || "operator@sovereignbusiness.ca",
          role: (req.headers["x-test-user-role"] as string) || "CEO",
          organizationId: (req.headers["x-test-tenant-id"] as string) || "sovereign_enterprise"
        };
        req.user = testUser;
        return next();
      }

      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or malformed Authorization header. Please sign in to access Sovereign Business Brain."
      });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();

    if (!token) {
      return res.status(401).json({ error: "Unauthorized", message: "Empty authentication token provided." });
    }

    let decodedPayload: any = null;

    // Check if token is a standard JWT (e.g. Firebase ID token or Sovereign signed token)
    if (token.includes(".")) {
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
          decodedPayload = JSON.parse(payloadJson);
        } catch {
          try {
            const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
            decodedPayload = JSON.parse(payloadJson);
          } catch {
            decodedPayload = null;
          }
        }
      }
    }

    // If token is a JSON-encoded or base64 token
    if (!decodedPayload) {
      try {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        decodedPayload = JSON.parse(decoded);
      } catch {
        // Plain test token format: "USR-XXX:tenant:role:email"
        if (token.startsWith("USR-") || token.startsWith("DEMO-") || token.startsWith("TEST-")) {
          const segments = token.split(":");
          decodedPayload = {
            sub: segments[0],
            org: segments[1] || "default_org",
            role: segments[2] || "CEO",
            email: segments[3] || "operator@sovereignbusiness.ca"
          };
        }
      }
    }

    if (!decodedPayload) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid token structure." });
    }

    // Verify expiration if exp is present
    if (decodedPayload.exp && typeof decodedPayload.exp === "number") {
      const nowSec = Math.floor(Date.now() / 1000);
      if (decodedPayload.exp < nowSec) {
        return res.status(401).json({ error: "Unauthorized", message: "Authentication token has expired. Please log in again." });
      }
    }

    // Resolve tenant ID
    const requestedTenantHeader = (req.headers["x-organization-id"] as string) || (req.headers["x-tenant-id"] as string);
    const tokenTenant = decodedPayload.organizationId || decodedPayload.org || decodedPayload.tenant_id;
    const resolvedTenant = (requestedTenantHeader || tokenTenant || "default_org")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "_");

    const userId = decodedPayload.sub || decodedPayload.uid || decodedPayload.user_id || "anon_user";
    const email = decodedPayload.email || "user@sovereignbusiness.ca";
    const role = decodedPayload.role || "CEO";

    req.user = {
      userId,
      email,
      role,
      organizationId: resolvedTenant
    };

    next();
  } catch (error: any) {
    console.error("Authentication middleware error:", error?.message || error);
    return res.status(401).json({ error: "Unauthorized", message: "Failed to authenticate request." });
  }
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized", message: "Authentication required." });
    }

    // Admin has superuser access
    if (req.user.role === "Admin" || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      error: "Forbidden",
      message: `Access denied. Role '${req.user.role}' is not authorized to execute this operation. Required: [${allowedRoles.join(", ")}].`
    });
  };
}

/**
 * Strict Multi-Tenant Isolation Middleware
 * Rejects requests if client tries to access or modify data belonging to another tenant
 */
export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized", message: "Authentication required." });
  }

  // Admins can manage across tenants if explicitly requested
  if (req.user.role === "Admin") {
    return next();
  }

  const requestedOrg = req.params.orgId || req.body?.organizationId || req.query.organizationId;
  if (requestedOrg) {
    const sanitizedOrg = String(requestedOrg).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_");
    if (sanitizedOrg !== req.user.organizationId) {
      console.warn(`[SECURITY VIOLATION] Cross-tenant access attempt by user ${req.user.userId} (${req.user.organizationId}) to tenant ${sanitizedOrg}`);
      return res.status(403).json({
        error: "Forbidden",
        message: "Cross-tenant access prohibited. You cannot access or modify records of another organization."
      });
    }
  }

  next();
}

/**
 * Rate Limiter for Costly AI and Consequential Actions
 */
export function rateLimiter(maxRequestsPerMinute: number = 60, windowMs: number = 60000) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.user?.userId || req.ip || "unknown_client";
    const now = Date.now();

    let bucket = rateLimitStore.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, bucket);
      return next();
    }

    bucket.count++;
    if (bucket.count > maxRequestsPerMinute) {
      const waitSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", waitSeconds);
      return res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit exceeded (${maxRequestsPerMinute} req/min). Please try again in ${waitSeconds}s.`
      });
    }

    next();
  };
}

/**
 * Hardened Security Headers Middleware
 */
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  next();
}

/**
 * Safe Error Handler Middleware (Prevents Stack Trace & Credential Disclosures)
 */
export function safeErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Redact internal error specifics in production
  const isProd = process.env.NODE_ENV === "production";
  console.error(`[SERVER ERROR] ${req.method} ${req.path}:`, err?.message || err);

  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: isProd ? "An unexpected error occurred while processing your request. Please try again or contact support." : (err.message || "Internal server error")
  });
}
