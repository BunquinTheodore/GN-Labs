import "server-only";

import { adminDb } from "@/lib/firebase-admin";

export interface Job {
  slug: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  employmentType: string;
  postedAt: string;
  summary: string;
  description: string;
  tags: string[];
  isExample?: boolean;
}

export interface TalentSignup {
  id: string;
  name: string;
  email: string;
  role: string;
  skills?: string;
  linkUrl?: string;
  submittedAt: string;
}

export interface JobRequest {
  id: string;
  title: string;
  company: string;
  contactEmail: string;
  location: string;
  employmentType: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export interface ConsultationRequest {
  id: string;
  name: string;
  company: string;
  email: string;
  automationGoal: string;
  budgetRange?: string;
  preferredDate?: string;
  submittedAt: string;
}

// Firestore collections, namespaced with a `labs_` prefix so this app's data
// can never collide with GN Academy's own collections in the shared
// Firebase project. All access here goes through the admin SDK (service
// account), which bypasses Firestore security rules — there is no
// client-side Firestore access from GN Labs.
const JOBS_COLLECTION = "labs_jobs";
const JOB_REQUESTS_COLLECTION = "labs_job_requests";
const TALENT_COLLECTION = "labs_talent";
const CONSULTATIONS_COLLECTION = "labs_consultations";

export async function getJobs(): Promise<Job[]> {
  try {
    const snapshot = await adminDb()
      .collection(JOBS_COLLECTION)
      .orderBy("postedAt", "desc")
      .get();
    return snapshot.docs.map((doc) => doc.data() as Job);
  } catch (error) {
    // Missing collection / unreachable Firestore: fall back to an empty
    // data set instead of throwing, so pages can still render an empty
    // state.
    console.warn("[data] could not read jobs from Firestore", error);
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const jobs = await getJobs();
  return jobs.find((job) => job.slug === slug);
}

export async function appendJobRequest(record: JobRequest): Promise<void> {
  await adminDb().collection(JOB_REQUESTS_COLLECTION).doc(record.id).set(record);
}

export async function appendTalentSignup(record: TalentSignup): Promise<void> {
  await adminDb().collection(TALENT_COLLECTION).doc(record.id).set(record);
}

export async function appendConsultationRequest(
  record: ConsultationRequest
): Promise<void> {
  await adminDb().collection(CONSULTATIONS_COLLECTION).doc(record.id).set(record);
}
