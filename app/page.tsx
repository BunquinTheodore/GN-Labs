import Link from "next/link";
import Image from "next/image";
import {
  Workflow,
  PlugZap,
  Gauge,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";

const pillars = [
  {
    icon: Workflow,
    title: "Process automation",
    body: "Map the repetitive work in your business and replace it with reliable, monitored automations.",
  },
  {
    icon: PlugZap,
    title: "AI integration",
    body: "Connect large language models to the tools your team already uses, without a rebuild.",
  },
  {
    icon: Gauge,
    title: "Measurable rollout",
    body: "Every integration ships with a clear scope, a pilot, and a way to tell if it worked.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--cyan) 18%, transparent), transparent), radial-gradient(40% 40% at 85% 20%, color-mix(in oklch, var(--lime) 12%, transparent), transparent)",
          }}
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="glass gradient-ring inline-flex items-center gap-2 rounded-full border-glass-border px-4 py-1.5 text-sm text-mist-dim">
            <Sparkles className="size-3.5 text-lime" aria-hidden="true" />
            AI integration for business
          </span>

          <h1 className="text-balance font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl md:text-6xl">
            Practical AI integrations that fit how your team already works.
          </h1>

          <p className="max-w-xl text-pretty text-base text-mist-dim sm:text-lg">
            GN Labs designs and builds AI-powered automations and integrations
            for growing businesses, from a first working pilot to a system
            your team can rely on.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button render={<Link href="/consultation" />} size="lg" className="px-6">
              Book a Consultation
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              render={<Link href="/services" />}
              variant="outline"
              size="lg"
              className="px-6"
            >
              See services
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2">
          {pillars.map(({ icon: Icon, title, body }, index) => (
            <GlassCard
              key={title}
              as="article"
              className={
                index === 0
                  ? "flex flex-col justify-between gap-6 sm:col-span-2 sm:flex-row sm:items-center"
                  : "flex flex-col gap-4 border-t-2 border-t-lime/30"
              }
            >
              {index === 0 ? (
                <>
                  <div className="flex flex-col gap-4">
                    <span className="flex size-12 items-center justify-center rounded-lg border border-glass-border bg-glass text-lime">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h2 className="font-display text-xl font-semibold tracking-tight text-mist sm:text-2xl">
                      {title}
                    </h2>
                    <p className="max-w-md text-sm text-mist-dim sm:text-base">{body}</p>
                  </div>
                  <span className="hidden font-display text-6xl font-semibold text-glass-border sm:block">
                    01
                  </span>
                </>
              ) : (
                <>
                  <span className="flex size-10 items-center justify-center rounded-lg border border-glass-border bg-glass text-lime">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-mist">
                    {title}
                  </h2>
                  <p className="text-sm text-mist-dim">{body}</p>
                </>
              )}
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="about" className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <GlassCard className="grid gap-0 p-0 sm:grid-cols-[minmax(0,300px)_1fr] sm:items-stretch">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[calc(var(--radius-lg)-1px)] sm:aspect-auto sm:rounded-l-[calc(var(--radius-lg)-1px)] sm:rounded-tr-none">
              <Image
                src="/team-01.jpg"
                alt="The GN Labs team gathered around a glowing gn Ventures sign"
                fill
                sizes="(min-width: 640px) 300px, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/40 via-transparent to-transparent sm:bg-gradient-to-r" />
            </div>

            <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-mist">
                About GN Labs
              </h2>
              <p className="max-w-2xl text-sm text-mist-dim sm:text-base">
                GN Labs is the applied AI studio in the GN Ventures family. We
                work alongside operators and engineering teams to scope,
                build, and hand off AI integrations that hold up in
                production, not just in a demo.
              </p>
              <p className="text-sm text-mist-dim">
                Part of the GN family alongside GN Club, GN Academy, and GN
                Media.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
