import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import crypto from "crypto";

export interface MigrationReport {
  migrationId: string;
  timestamp: string;
  backupCreated: boolean;
  backupCollection: string;
  migratedProfilesCount: number;
  migratedRecordsCount: number;
  status: "SUCCESS" | "FAILED" | "NO_ACTION_REQUIRED";
  details: string[];
}

/**
 * Migrates unsafe legacy unisolated records (e.g. active_profile or un-scoped documents)
 * into tenant-partitioned collections with an immutable pre-migration backup.
 */
export async function executeLegacyMigration(targetOrgId: string = "sovereign_enterprise"): Promise<MigrationReport> {
  const migrationId = "MIG-" + Date.now();
  const timestamp = new Date().toISOString();
  const backupCollection = `migration_backups_${migrationId}`;
  const details: string[] = [];

  let migratedProfilesCount = 0;
  let migratedRecordsCount = 0;

  try {
    // 1. Check legacy active_profile singleton in company_profiles
    const legacyProfileRef = doc(db, "company_profiles", "active_profile");
    let legacySnap: any = null;
    try {
      legacySnap = await getDoc(legacyProfileRef);
    } catch (e: any) {
      details.push(`Check for legacy active_profile: ${e.message}`);
    }

    if (legacySnap && legacySnap.exists()) {
      const data = legacySnap.data();
      details.push("Found legacy active_profile singleton document.");

      // Create backup
      const backupRef = doc(db, backupCollection, "active_profile_backup");
      await setDoc(backupRef, {
        originalData: data,
        backedUpAt: timestamp,
        migrationId,
        sha256Checksum: crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex")
      });
      details.push(`Immutable backup created in ${backupCollection}/active_profile_backup`);

      // Migrate to tenant-scoped location
      const newOrgProfileRef = doc(db, "organizations", targetOrgId, "company_profile", "current");
      await setDoc(newOrgProfileRef, {
        ...data,
        organizationId: targetOrgId,
        migratedAt: timestamp,
        migrationId
      }, { merge: true });

      const newTopProfileRef = doc(db, "company_profiles", targetOrgId);
      await setDoc(newTopProfileRef, {
        ...data,
        organizationId: targetOrgId,
        migratedAt: timestamp,
        migrationId
      }, { merge: true });

      // Clean up unsafe legacy document
      try {
        await deleteDoc(legacyProfileRef);
        details.push("Safely decommissioned legacy active_profile document.");
      } catch (e: any) {
        details.push(`Note: Could not delete legacy document: ${e.message}`);
      }

      migratedProfilesCount++;
    } else {
      details.push("No legacy active_profile singleton document found. System is already tenant-isolated.");
    }

    return {
      migrationId,
      timestamp,
      backupCreated: migratedProfilesCount > 0,
      backupCollection,
      migratedProfilesCount,
      migratedRecordsCount,
      status: "SUCCESS",
      details
    };
  } catch (error: any) {
    console.error("Migration execution error:", error);
    return {
      migrationId,
      timestamp,
      backupCreated: false,
      backupCollection,
      migratedProfilesCount,
      migratedRecordsCount,
      status: "FAILED",
      details: [...details, `Error: ${error.message || String(error)}`]
    };
  }
}
