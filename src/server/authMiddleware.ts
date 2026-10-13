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

// Secret key for server-issued HMAC-SHA256 session tokens
const SERVER_SESSION_SECRET = process.env.SBB_AUTH_SECRET || "sbb_enterprise_cryptographic_secret_key_2026_prod";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0577810698";

// Google Public Certificates cache for Firebase ID token verification
let googleCertsCache: { [kid: string]: string } = {};
let googleCertsExpiry = 0;

export async function getGooglePublicCerts(): Promise<{ [kid: string]: string }> {
  if (Date.now() < googleCertsExpiry && Object.keys(googleCertsCache).length > 0) {
    return googleCertsCache;
  }
  try {
    const res = await fetch("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com");
    if (res.ok) {
      const data = await res.json();
      googleCertsCache = data;
      googleCertsExpiry = Date.now() + 3600000; // Cache 1 hour
      return googleCertsCache;
    }
  } catch (e: any) {
    // Log in non-test mode
    if (process.env.NODE_ENV !== "test") {
      console.warn("Could not fetch Google public certs:", e?.message);
    }
  }
  return googleCertsCache;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Prevents client-side tampering with roles, user IDs, or organization IDs.
 */
export function createSignedSessionToken(user: AuthenticatedUser, expiresInSec = 86400): string {
  const payload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSec
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SERVER_SESSION_SECRET)
    .update(`sbb_v1.${payloadB64}`)
    .digest("base64url");
  return `sbb_v1.${payloadB64}.${signature}`;
}

/**
 * Cryptographically verifies a signed SBB session token using constant-time comparison.
 * Returns decoded AuthenticatedUser if signature and expiry are valid; otherwise null.
 */
export function verifySignedSessionToken(token: string): AuthenticatedUser | null {
  if (!token || !token.startsWith("sbb_v1.")) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [prefix, payloadB64, signature] = parts;
  if (prefix !== "sbb_v1") return null;

  const expectedSig = crypto.createHmac("sha256", SERVER_SESSION_SECRET)
    .update(`sbb_v1.${payloadB64}`)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null; // Cryptographic signature verification failed! Forged or tampered token.
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && typeof payload.exp === "number" && payload.exp < now) {
      return null; // Expired token
    }
    if (!payload.userId || !payload.organizationId || !payload.role) {
      return null;
    }
    return {
      userId: String(payload.userId),
      email: String(payload.email || "user@sovereignbusiness.ca"),
      role: String(payload.role),
      organizationId: String(payload.organizationId).toLowerCase().replace(/[^a-z0-9_-]/g, "_")
    };
  } catch {
    return null;
  }
}

/**
 * Cryptographically verifies a Firebase ID Token.
 * Validates issuer, audience, subject, expiry, and signature against Google's public certificates.
 */
export async function verifyFirebaseIdToken(token: string, expectedProjectId = FIREBASE_PROJECT_ID): Promise<AuthenticatedUser | null> {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"));
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));

    const now = Math.floor(Date.now() / 1000);

    // Verify audience and issuer match Firebase project
    if (payload.aud !== expectedProjectId) return null;
    if (payload.iss !== `https://securetoken.google.com/${expectedProjectId}`) return null;
    if (!payload.sub || typeof payload.sub !== "string") return null;
    if (payload.exp && payload.exp < now) return null;
    if (payload.iat && payload.iat > now + 300) return null;

    // Cryptographic signature verification
    if (header.alg === "RS256" && header.kid) {
      const certs = await getGooglePublicCerts();
      const cert = certs[header.kid];
      if (cert) {
        const verifier = crypto.createVerify("RSA-SHA256");
        verifier.update(`${parts[0]}.${parts[1]}`);
        const isValid = verifier.verify(cert, Buffer.from(parts[2], "base64url"));
        if (!isValid) return null;
      } else {
        // If Google certs cannot be resolved, fail closed in production
        if (process.env.NODE_ENV === "production") {
          return null;
        }
      }
    } else {
      // Any unsupported algorithm is strictly rejected
      return null;
    }

    const orgId = (payload.organizationId || payload.org || "default_org")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");

    return {
      userId: payload.sub,
      email: payload.email || "user@sovereignbusiness.ca",
      role: payload.role || "Executive",
      organizationId: orgId
    };
  } catch {
    return null;
  }
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
 * Extract and cryptographically verify authentication, resolving tenant context.
 * Rejects unverified strings, forged tokens, and expired sessions.
 */
export async function verifyAuthAndTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Allow public health checks and webhooks
    if (req.path === "/api/health" || req.path === "/health" || req.path === "/api/lead/capture") {
      return next();
    }

    const authHeader = req.headers.authorization || (req.headers["x-sbb-session-token"] as string);

    if (!authHeader) {
      // Only permit dev identity if explicitly configured in non-production environments
      if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH === "true") {
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

    let verifiedUser: AuthenticatedUser | null = null;

    // 1. Try SBB Cryptographic HMAC Session Token
    if (token.startsWith("sbb_v1.")) {
      verifiedUser = verifySignedSessionToken(token);
    } 
    // 2. Try Firebase ID Token (RS256 JWT)
    else if (token.includes(".")) {
      verifiedUser = await verifyFirebaseIdToken(token);
    }

    // Fail closed: reject any unverified, fabricated, or tampered token
    if (!verifiedUser) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Cryptographic token verification failed. Forged, expired, or invalid session token."
      });
    }

    req.user = verifiedUser;
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
  const isProd = process.env.NODE_ENV === "production";
  console.error(`[SERVER ERROR] ${req.method} ${req.path}:`, err?.message || err);

  res.status(err.status || 500).json({
    error: err.name || "InternalServerError",
    message: isProd ? "An unexpected error occurred while processing your request. Please try again or contact support." : (err.message || "Internal server error")
  });
}
