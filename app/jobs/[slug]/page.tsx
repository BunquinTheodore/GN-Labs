import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Briefcase, MapPin, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/glass-card";
import { getJobBySlug, getJobs } from "@/lib/jobs";

export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((job) => ({ slug: job.slug }));
}

export async function generateMetadata(
  props: PageProps<"/jobs/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return { title: "Job not found | GN Labs" };
  }

  return {
    title: `${job.title} | GN Labs Jobs`,
    description: job.summary,
  };
}

export default async function JobDetailPage(props: PageProps<"/jobs/[slug]">) {
  const { slug } = await props.params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Button render={<Link href="/jobs" />} variant="ghost" size="sm" className="-ml-2 mb-6">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to jobs
        </Button>

        <GlassCard>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-mist sm:text-4xl">
                {job.title}
              </h1>
              <p className="mt-1 text-base text-mist-dim">{job.company}</p>
            </div>
            {job.isExample && (
              <Badge className="border-glass-border bg-glass text-amber">
                Example listing
              </Badge>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-mist-dim">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden="true" />
              {job.location}
              {job.remote ? " (remote)" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="size-3.5" aria-hidden="true" />
              {job.employmentType}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Posted {job.postedAt}
            </span>
          </div>

          <p className="mt-8 max-w-2xl whitespace-pre-line text-base leading-relaxed text-mist-dim">
            {job.description}
          </p>

          {job.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
