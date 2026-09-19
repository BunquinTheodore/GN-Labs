import type { Metadata } from "next";
import { Users, Sparkles, Target } from "lucide-react";
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

        <GlassCard className="mt-10 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
          {/*
            Team photo placeholder slot (optional per brief). Drop a real
            photo at public/team-01.jpg and replace this icon block with:
            <Image src="/team-01.jpg" alt="The GN Labs team" width={320} height={320} />
            No real team photo exists yet.
          */}
          <div className="glass-strong flex size-24 shrink-0 items-center justify-center rounded-2xl border-glass-border sm:size-28">
            <Users className="size-10 text-mist-dim" aria-hidden="true" />
          </div>
          <p className="text-sm text-mist-dim sm:text-base">
            Team photo coming soon. GN Labs is a small, hands-on team, part
            of GN Ventures alongside GN Club, GN Academy, and GN Media.
          </p>
        </GlassCard>

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
