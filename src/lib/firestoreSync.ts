import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import { UserSession } from "../components/LoginScreen";

export interface CreativeAsset {
  id: string;
  userId: string;
  type: "image" | "video" | "music" | "transcription" | "chat" | "voice";
  title: string;
  prompt: string;
  modelUsed: string;
  mediaUrl: string;
  metadata?: string;
  createdAt: string;
  organizationId?: string;
}

export interface PersistenceResult {
  success: boolean;
  persistedCount?: number;
  error?: string;
}

/**
 * Standardize tenant ID from session or company name
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

/**
 * Persist user profile to Firestore `users/{userId}` and register organization membership
 */
export async function saveUserToFirestore(session: UserSession): Promise<PersistenceResult> {
  try {
    const orgId = getTenantId(session.companyName);
    const userDocRef = doc(db, "users", session.id);
    await setDoc(userDocRef, {
      uid: session.id,
      email: session.email,
      displayName: session.name,
      role: session.role,
      department: session.department,
      companyName: session.companyName || "Sovereign Enterprise",
      organizationId: orgId,
      customAllowedTabs: session.customAllowedTabs || [],
      lastLoginAt: session.loggedInAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Ensure organization membership document exists
    const orgMemberRef = doc(db, "organizations", orgId, "members", session.id);
    await setDoc(orgMemberRef, {
      userId: session.id,
      email: session.email,
      displayName: session.name,
      role: session.role,
      department: session.department,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error("Firestore user sync error:", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Persist company profile / brand identity to Firestore with tenant isolation
 */
export async function saveCompanyProfileToFirestore(profile: any, tenantId?: string): Promise<PersistenceResult> {
  const orgId = getTenantId(tenantId || profile?.organizationId || profile?.companyName);
  try {
    // 1. Tenant-isolated subcollection document
    const orgProfileDocRef = doc(db, "organizations", orgId, "company_profile", "current");
    await setDoc(orgProfileDocRef, {
      ...profile,
      organizationId: orgId,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 2. Tenant-keyed top-level document
    const profileDocRef = doc(db, "company_profiles", orgId);
    await setDoc(profileDocRef, {
      ...profile,
      organizationId: orgId,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error("Firestore profile sync error for tenant", orgId, ":", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Fetch company profile from Firestore for a specific tenant
 */
export async function fetchCompanyProfileFromFirestore(tenantId?: string): Promise<any | null> {
  const orgId = getTenantId(tenantId);
  try {
    // Check tenant subcollection first
    const orgProfileDocRef = doc(db, "organizations", orgId, "company_profile", "current");
    const orgSnap = await getDoc(orgProfileDocRef);
    if (orgSnap.exists()) {
      return orgSnap.data();
    }

    // Check tenant top-level document
    const profileDocRef = doc(db, "company_profiles", orgId);
    const snap = await getDoc(profileDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err: any) {
    console.error("Firestore fetch profile error for tenant", orgId, ":", err);
  }
  return null;
}

/**
 * Persist marketing campaigns to Firestore with tenant isolation
 */
export async function saveCampaignsToFirestore(campaigns: any[], tenantId?: string): Promise<PersistenceResult> {
  const orgId = getTenantId(tenantId);
  try {
    let saved = 0;
    for (const c of campaigns) {
      if (c && c.id) {
        // Write to tenant-isolated subcollection
        const orgCampRef = doc(db, "organizations", orgId, "campaigns", String(c.id));
        await setDoc(orgCampRef, { 
          ...c, 
          organizationId: orgId, 
          updatedAt: new Date().toISOString() 
        }, { merge: true });

        // Maintain top-level record with organizationId
        const cRef = doc(db, "campaigns", `${orgId}_${c.id}`);
        await setDoc(cRef, { 
          ...c, 
          organizationId: orgId, 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
        saved++;
      }
    }
    return { success: true, persistedCount: saved };
  } catch (err: any) {
    console.error("Firestore campaigns sync error for tenant", orgId, ":", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Persist CRM customer leads to Firestore with tenant isolation
 */
export async function saveLeadsToFirestore(leads: any[], tenantId?: string): Promise<PersistenceResult> {
  const orgId = getTenantId(tenantId);
  try {
    let saved = 0;
    for (const l of leads) {
      if (l && l.id) {
        // Write to tenant-isolated subcollection
        const orgLeadRef = doc(db, "organizations", orgId, "leads", String(l.id));
        await setDoc(orgLeadRef, { 
          ...l, 
          organizationId: orgId, 
          updatedAt: new Date().toISOString() 
        }, { merge: true });

        // Maintain top-level record with organizationId
        const lRef = doc(db, "leads", `${orgId}_${l.id}`);
        await setDoc(lRef, { 
          ...l, 
          organizationId: orgId, 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
        saved++;
      }
    }
    return { success: true, persistedCount: saved };
  } catch (err: any) {
    console.error("Firestore leads sync error for tenant", orgId, ":", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Persist immutable audit log to Firestore with tenant isolation
 */
export async function saveAuditLogToFirestore(log: any, tenantId?: string): Promise<PersistenceResult> {
  const orgId = getTenantId(tenantId);
  try {
    if (log && log.id) {
      // Write to tenant-isolated subcollection
      const orgLogRef = doc(db, "organizations", orgId, "audit_logs", String(log.id));
      await setDoc(orgLogRef, { 
        ...log, 
        organizationId: orgId, 
        savedAt: new Date().toISOString() 
      }, { merge: true });

      // Maintain top-level record with organizationId
      const logRef = doc(db, "audit_logs", `${orgId}_${log.id}`);
      await setDoc(logRef, { 
        ...log, 
        organizationId: orgId, 
        savedAt: new Date().toISOString() 
      }, { merge: true });
    }
    return { success: true };
  } catch (err: any) {
    console.error("Firestore audit log sync error for tenant", orgId, ":", err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Persist multimodal AI creative asset to Firestore with tenant isolation
 */
export async function saveCreativeAssetToFirestore(asset: CreativeAsset, tenantId?: string): Promise<PersistenceResult> {
  const orgId = getTenantId(tenantId || asset.organizationId);
  try {
    const assetRef = doc(db, "organizations", orgId, "ai_creatives", asset.id);
    await setDoc(assetRef, {
      ...asset,
      organizationId: orgId,
      savedAt: new Date().toISOString()
    }, { merge: true });

    // Also write to top-level collection with organizationId
    const topAssetRef = doc(db, "ai_creatives", asset.id);
    await setDoc(topAssetRef, {
      ...asset,
      organizationId: orgId,
      savedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (err: any) {
    console.error("Firestore creative asset sync error for tenant", orgId, ":", err);
    return { success: false, error: err?.message || String(err) };
  }
}
