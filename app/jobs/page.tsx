import Link from "next/link";
import type { Metadata } from "next";
import { Briefcase, MapPin, ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass-card";
import { getJobs } from "@/lib/jobs";

export const metadata: Metadata = {
  title: "Jobs | GN Labs",
  description: "Open roles and talent opportunities from GN Labs.",
};

// Keeps the number of simultaneously blurred, animating GlassCards bounded
// even if the Firestore-backed role list grows well past a single screen.
const MAX_VISIBLE_JOBS = 40;

export default async function JobsPage() {
  const allJobs = await getJobs();
  const jobs = allJobs.slice(0, MAX_VISIBLE_JOBS);

  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl">
              Jobs
            </h1>
            <p className="mt-3 max-w-xl text-base text-mist-dim">
              Roles from GN Labs and companies building with us.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/jobs/post" />} variant="outline">
              Post a job
            </Button>
            <Button render={<Link href="/jobs/join" />} variant="secondary">
              Join the talent list
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {jobs.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-3 py-16 text-center">
              <Inbox className="size-8 text-mist-dim" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold tracking-tight text-mist">
                No open roles right now
              </h2>
              <p className="max-w-sm text-sm text-mist-dim">
                Check back soon, or join the talent list so we can reach
                you when a role fits.
              </p>
              <Button render={<Link href="/jobs/join" />} className="mt-2">
                Join the talent list
              </Button>
            </GlassCard>
          ) : (
            jobs.map((job) => (
              <GlassCard
                key={job.slug}
                as="article"
                // content-visibility skips paint/layout (and pauses the
                // .glass animations inside) for rows scrolled off-screen,
                // so blur+animation cost stays flat as the list grows.
                className="flex flex-col gap-3 [content-visibility:auto] [contain-intrinsic-size:0_220px]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-tight text-mist">
                      <Link href={`/jobs/${job.slug}`} className="hover:text-lime">
                        {job.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-mist-dim">{job.company}</p>
                  </div>
                  {job.isExample && (
                    <Badge className="border-glass-border bg-glass text-amber">
                      Example
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-mist-dim">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {job.location}
                    {job.remote ? " (remote)" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5" aria-hidden="true" />
                    {job.employmentType}
                  </span>
                </div>

                <p className="text-sm text-mist-dim">{job.summary}</p>

                <div>
                  <Button render={<Link href={`/jobs/${job.slug}`} />} variant="outline" size="sm">
                    View role
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
