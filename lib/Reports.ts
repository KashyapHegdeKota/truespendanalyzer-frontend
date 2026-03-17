import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";

export interface SavedReport {
  id: string;
  fileName: string;
  fileSize: number;
  numPages: number;
  savedAt: Timestamp;
  totalIn: number;
  totalOut: number;
  transactionsFound: number;
  extractionMode: string;
  result: Record<string, unknown>;
}

/**
 * Save an analysis result to Firestore under the user's own collection.
 * Path: users/{uid}/reports/{auto-id}
 */
export async function saveReport(
  uid: string,
  data: {
    fileName: string;
    fileSize: number;
    numPages: number;
    transactionsFound: number;
    extractionMode: string;
    result: Record<string, unknown>;
  }
): Promise<string> {
  const ref = collection(firestore, "users", uid, "reports");
  const doc = await addDoc(ref, {
    ...data,
    totalIn:  data.result.total_in  ?? 0,
    totalOut: data.result.total_out ?? 0,
    savedAt:  serverTimestamp(),
  });
  return doc.id;
}

/**
 * Fetch all reports for a user, newest first.
 */
export async function getReports(uid: string): Promise<SavedReport[]> {
  const ref = collection(firestore, "users", uid, "reports");
  const q   = query(ref, orderBy("savedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedReport));
}