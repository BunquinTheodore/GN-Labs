import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles, Target } from "lucide-react";
import { GlassCard } from "@/components/glass-card";

export const metadata: Metadata = {
  title: "About | GN Labs",
  description: "GN Labs is the applied AI studio in the GN Ventures family.",
};

const values = [
  {
    icon: Target,
    title: "Scoped, not sprawling",
    body: "We start with one workflow and prove it works before expanding.",
  },
  {
    icon: Sparkles,
    title: "Built to hand off",
    body: "Every integration ships with documentation your team can maintain.",
  },
];

export default function AboutPage() {
  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl">
          About GN Labs
        </h1>
        <p className="mt-4 text-base text-mist-dim sm:text-lg">
          GN Labs is the applied AI studio in the GN Ventures family. We work
          alongside operators and engineering teams to scope, build, and
          hand off AI integrations that hold up in production.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <GlassCard className="glass-strong grid gap-0 p-0 sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] sm:rounded-l-[calc(var(--radius-lg)-1px)] sm:rounded-tr-none">
            <Image
              src="/team-01.jpg"
              alt="The GN Labs team gathered around a glowing gn Ventures sign"
              fill
              sizes="(min-width: 640px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent" />
          </div>

          <div className="flex flex-col justify-center gap-4 p-8 sm:p-10">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-mist-dim">
              The team
            </span>
            <p className="text-base text-mist-dim sm:text-lg">
              GN Labs is a small, hands-on team, part of GN Ventures alongside
              GN Club, GN Academy, and GN Media.
            </p>
            <p className="text-sm text-mist-dim">
              Eleven people, one workshop, and a habit of shipping things that
              hold up after the demo ends.
            </p>
          </div>
        </GlassCard>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {values.map(({ icon: Icon, title, body }) => (
            <GlassCard key={title} as="article" className="flex flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg border border-glass-border bg-glass text-lime">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-lg font-semibold tracking-tight text-mist">
                {title}
              </h2>
              <p className="text-sm text-mist-dim">{body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
