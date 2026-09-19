import { promises as fs } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    // Missing or unreadable file: fall back to an empty data set instead of
    // throwing, so pages can still render an empty state.
    console.warn(`[data] could not read ${filename}`, error);
    return fallback;
  }
}

async function appendJsonRecord<T>(filename: string, record: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  const existing = await readJsonFile<T[]>(filename, []);
  existing.push(record);
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2) + "\n", "utf-8");
}

export function getJobs(): Promise<Job[]> {
  return readJsonFile<Job[]>("jobs.json", []);
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const jobs = await getJobs();
  return jobs.find((job) => job.slug === slug);
}

export function appendJobRequest(record: JobRequest): Promise<void> {
  return appendJsonRecord<JobRequest>("job-requests.json", record);
}

export function appendTalentSignup(record: TalentSignup): Promise<void> {
  return appendJsonRecord<TalentSignup>("talent.json", record);
}
