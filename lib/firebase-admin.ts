import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Lazily initialised so that importing this module (e.g. during `next build`
 * prerendering) never touches the credential — only an actual Firestore
 * operation does. This reuses the GN Academy Firebase *project* (same
 * project id / service account) but writes to clearly namespaced
 * `labs_*` collections so data can never collide with GN Academy's own
 * collections in that project.
 */
let app: App | null = null;
let db: Firestore | null = null;

function adminApp(): App {
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
  return app;
}

export function adminDb(): Firestore {
  if (db) return db;
  db = getFirestore(adminApp());
  // Optional fields (e.g. skills, linkUrl, budgetRange) are omitted as
  // `undefined` rather than `null` by the API routes; without this, the
  // Firestore SDK throws on any `undefined` property value.
  db.settings({ ignoreUndefinedProperties: true });
  return db;
}
