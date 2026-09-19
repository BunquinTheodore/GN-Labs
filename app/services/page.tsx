import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";

export const metadata: Metadata = {
  title: "Services: AI Integration for Business | GN Labs",
  description:
    "GN Labs helps businesses integrate AI into their existing workflows and tools.",
};

const approach = [
  {
    step: "01",
    title: "Scope",
    body: "A short consultation to understand your workflows, tools, and what you want automated or integrated.",
  },
  {
    step: "02",
    title: "Pilot",
    body: "A small, working version built against a real workflow, so you can evaluate it before committing further.",
  },
  {
    step: "03",
    title: "Rollout",
    body: "Hardening, documentation, and handoff so your team can run and extend the integration on its own.",
  },
];

export default function ServicesPage() {
  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl">
          AI integration for business
        </h1>
        <p className="mt-4 max-w-2xl text-base text-mist-dim sm:text-lg">
          GN Labs helps businesses put AI to work inside the tools and
          processes they already use. Below is how we approach an
          engagement.
        </p>

        <div className="mt-12">
          <ol className="relative flex flex-col gap-8 sm:flex-row sm:gap-0">
            {approach.map((item, index) => (
              <li key={item.step} className="relative flex-1 sm:px-4 sm:first:pl-0 sm:last:pr-0">
                {/* connecting line: vertical on mobile, horizontal on sm+ */}
                {index < approach.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 h-[calc(100%+1.25rem)] w-px bg-glass-border sm:left-auto sm:top-4 sm:right-0 sm:h-px sm:w-[calc(100%-2rem)] sm:translate-x-1/2"
                  />
                )}
                <div className="flex items-start gap-4 sm:flex-col sm:items-start sm:gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-glass-border bg-glass font-display text-xs font-semibold text-lime">
                    {item.step}
                  </span>
                  <div className="flex flex-col gap-1.5 pt-0.5 sm:pt-2">
                    <h2 className="font-display text-lg font-semibold tracking-tight text-mist">
                      {item.title}
                    </h2>
                    <p className="text-sm text-mist-dim">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/*
          TODO(open item): the detailed, itemized service list (specific
          integrations, platforms, pricing tiers) is not confirmed yet.
          Replace this placeholder block once the service catalog is
          finalized. Do not present example services below as a firm
          offering list.
        */}
        <GlassCard className="mt-12 flex flex-col gap-3">
          <span className="flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-amber">
            <ListTodo className="size-3.5" aria-hidden="true" />
            Detailed service list: to be confirmed
          </span>
          <p className="text-sm text-mist-dim sm:text-base">
            We are still finalizing the specific list of integrations and
            packages we offer. In the meantime, the fastest way to find out
            what GN Labs can do for your business is a short consultation
            where we look at your workflows directly.
          </p>
          <div className="pt-2">
            <Button render={<Link href="/consultation" />} size="lg" className="px-6">
              Book a Consultation
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
