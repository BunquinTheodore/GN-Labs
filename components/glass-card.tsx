import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: ReactNode;
  as?: "div" | "article" | "section";
}) {
  return <Tag className={cn("glass glass-card p-6", className)}>{children}</Tag>;
}
