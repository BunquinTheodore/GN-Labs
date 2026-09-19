import type { Metadata } from "next";
import { JobPostForm } from "@/components/job-post-form";

export const metadata: Metadata = {
  title: "Post a Job | GN Labs",
  description:
    "Submit a job for the GN Labs job board. Submissions are reviewed before they go live.",
};

export default function PostJobPage() {
  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl">
          Post a job
        </h1>
        <p className="mt-4 text-base text-mist-dim sm:text-lg">
          Submit a role for the GN Labs job board. Every submission is
          reviewed by our team and requires admin approval before it is
          published.
        </p>

        <div className="mt-10">
          <JobPostForm />
        </div>
      </div>
    </div>
  );
}
