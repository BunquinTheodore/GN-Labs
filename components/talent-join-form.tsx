"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/glass-card";

type FieldErrors = Record<string, string>;

export function TalentJoinForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setServerMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      role: String(data.get("role") ?? ""),
      skills: String(data.get("skills") ?? "") || undefined,
      linkUrl: String(data.get("linkUrl") ?? "") || undefined,
    };

    try {
      const res = await fetch("/api/jobs/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrors(json.errors ?? {});
        setServerMessage(json.message ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setServerMessage(json.message);
      setStatus("success");
      form.reset();
    } catch {
      setServerMessage("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <GlassCard className="flex flex-col items-center gap-3 py-12 text-center">
        <CheckCircle2 className="size-10 text-lime" aria-hidden="true" />
        <h2 className="font-display text-xl font-semibold tracking-tight text-mist">
          You&apos;re on the list
        </h2>
        <p className="max-w-md text-sm text-mist-dim">{serverMessage}</p>
        <Button variant="outline" onClick={() => setStatus("idle")} className="mt-2">
          Add someone else
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard as="section">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" aria-invalid={Boolean(errors.name)} />
            {errors.name && <FieldError message={errors.name} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <FieldError message={errors.email} />}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Role or specialty</Label>
          <Input
            id="role"
            name="role"
            placeholder="e.g. Backend engineer, automation consultant"
            aria-invalid={Boolean(errors.role)}
          />
          {errors.role && <FieldError message={errors.role} />}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="skills">Skills (optional)</Label>
          <Textarea id="skills" name="skills" rows={3} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="linkUrl">Portfolio or LinkedIn (optional)</Label>
          <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://" />
        </div>

        {status === "error" && serverMessage && Object.keys(errors).length === 0 && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            {serverMessage}
          </p>
        )}

        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-fit px-6">
          {status === "submitting" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {status === "submitting" ? "Submitting" : "Join the talent list"}
        </Button>
      </form>
    </GlassCard>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="size-3.5" aria-hidden="true" />
      {message}
    </p>
  );
}
