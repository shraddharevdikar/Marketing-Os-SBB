import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
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
}

/**
 * Persist user profile to Firestore `users/{userId}`
 */
export async function saveUserToFirestore(session: UserSession): Promise<void> {
  try {
    const userDocRef = doc(db, "users", session.id);
    await setDoc(userDocRef, {
      uid: session.id,
      email: session.email,
      displayName: session.name,
      role: session.role,
      department: session.department,
      companyName: session.companyName || "Sovereign Enterprise",
      customAllowedTabs: session.customAllowedTabs || [],
      lastLoginAt: session.loggedInAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Notice: Firestore user sync notice:", err);
  }
}

/**
 * Persist company profile / brand identity to Firestore
 */
export async function saveCompanyProfileToFirestore(profile: any): Promise<void> {
  try {
    const profileDocRef = doc(db, "company_profiles", "active_profile");
    await setDoc(profileDocRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Notice: Firestore profile sync notice:", err);
  }
}

/**
 * Fetch company profile from Firestore
 */
export async function fetchCompanyProfileFromFirestore(): Promise<any | null> {
  try {
    const profileDocRef = doc(db, "company_profiles", "active_profile");
    const snap = await getDoc(profileDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Notice: Firestore fetch profile notice:", err);
  }
  return null;
}

/**
 * Persist marketing campaigns to Firestore
 */
export async function saveCampaignsToFirestore(campaigns: any[]): Promise<void> {
  try {
    for (const c of campaigns) {
      if (c && c.id) {
        const cRef = doc(db, "campaigns", String(c.id));
        await setDoc(cRef, { ...c, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }
  } catch (err) {
    console.warn("Notice: Firestore campaigns sync notice:", err);
  }
}

/**
 * Persist CRM customer leads to Firestore
 */
export async function saveLeadsToFirestore(leads: any[]): Promise<void> {
  try {
    for (const l of leads) {
      if (l && l.id) {
        const lRef = doc(db, "leads", String(l.id));
        await setDoc(lRef, { ...l, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }
  } catch (err) {
    console.warn("Notice: Firestore leads sync notice:", err);
  }
}

/**
 * Persist immutable audit log to Firestore
 */
export async function saveAuditLogToFirestore(log: any): Promise<void> {
  try {
    if (log && log.id) {
      const logRef = doc(db, "audit_logs", String(log.id));
      await setDoc(logRef, { ...log, savedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn("Notice: Firestore audit log sync notice:", err);
  }
}

/**
 * Persist multimodal AI creative asset to Firestore
 */
export async function saveCreativeAssetToFirestore(asset: CreativeAsset): Promise<void> {
  try {
    const assetRef = doc(db, "ai_creatives", asset.id);
    await setDoc(assetRef, {
      ...asset,
      savedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Notice: Firestore creative asset sync notice:", err);
  }
}
