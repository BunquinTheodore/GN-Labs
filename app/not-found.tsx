import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found | GN Labs",
};

export default function NotFound() {
  return (
    <div className="px-4 py-24 sm:px-6">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
        <p className="font-ui text-sm uppercase tracking-[0.12em] text-lime">
          Error 404
        </p>
        <h1 className="text-balance font-display text-4xl tracking-tight text-mist sm:text-5xl">
          Page not found
        </h1>
        <p className="text-base text-mist-dim">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button render={<Link href="/" />} size="lg">
          Back to home
        </Button>
      </div>
    </div>
  );
}
