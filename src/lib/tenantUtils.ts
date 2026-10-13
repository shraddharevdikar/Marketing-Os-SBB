/**
 * Multi-Tenant Scoping and Partitioning Utilities
 * Provides standard, deterministic tenant identification for organizations and users.
 */

export function getTenantId(sessionOrOrgId?: string | { organizationId?: string; companyName?: string }): string {
  if (typeof sessionOrOrgId === "string" && sessionOrOrgId.trim()) {
    return sessionOrOrgId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  }
  if (sessionOrOrgId && typeof sessionOrOrgId === "object") {
    if (sessionOrOrgId.organizationId) {
      return sessionOrOrgId.organizationId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    }
    if (sessionOrOrgId.companyName) {
      return sessionOrOrgId.companyName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    }
  }
  return "default_org";
}
