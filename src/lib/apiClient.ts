/**
 * Sovereign Business Brain (SBB) Global API Interceptor
 * Injects verified Authorization Bearer tokens and multi-tenant headers
 * (X-Organization-Id, X-Tenant-Id) into all frontend API requests.
 */

export function buildAuthenticatedInit(input: RequestInfo | URL, init?: RequestInit): RequestInit | undefined {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;

  // Apply security & tenant headers to internal /api requests
  if (url.startsWith("/api") && !url.startsWith("/api/health")) {
    const headers = new Headers(init?.headers || {});

    try {
      const savedSession = localStorage.getItem("sbb_auth_session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.token && !headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${session.token}`);
        }
        if (session.organizationId && !headers.has("X-Organization-Id")) {
          headers.set("X-Organization-Id", session.organizationId);
          headers.set("X-Tenant-Id", session.organizationId);
        }
      }
    } catch (err) {
      // Safe fallback if session parse fails
    }

    return {
      ...init,
      headers,
    };
  }

  return init;
}

/**
 * Safely attach interceptor to window.fetch without throwing on read-only getters
 */
export function setupApiFetchInterceptor() {
  if (typeof window === "undefined" || typeof window.fetch !== "function") return;

  try {
    const originalFetch = window.fetch.bind(window);

    const customFetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const modifiedInit = buildAuthenticatedInit(input, init);
      return originalFetch(input, modifiedInit);
    };

    // Safely attempt defineProperty on window
    let intercepted = false;
    try {
      Object.defineProperty(window, "fetch", {
        value: customFetch,
        writable: true,
        configurable: true,
      });
      intercepted = true;
    } catch {
      // Failed on window, attempt Window.prototype
      try {
        if (typeof Window !== "undefined" && Window.prototype) {
          Object.defineProperty(Window.prototype, "fetch", {
            value: customFetch,
            writable: true,
            configurable: true,
          });
          intercepted = true;
        }
      } catch {
        // Fallback standard assignment if configurable
        try {
          (window as any).fetch = customFetch;
          intercepted = true;
        } catch {
          intercepted = false;
        }
      }
    }

    if (!intercepted) {
      console.info("[API Client] Environment enforces immutable window.fetch; proceeding with standard client.");
    }
  } catch (err) {
    console.warn("[API Client] Notice: Fetch interceptor setup handled gracefully:", err);
  }
}
