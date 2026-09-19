"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/glass-card";

type FieldErrors = Record<string, string>;

export function JobPostForm() {
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
      title: String(data.get("title") ?? ""),
      company: String(data.get("company") ?? ""),
      contactEmail: String(data.get("contactEmail") ?? ""),
      location: String(data.get("location") ?? ""),
      employmentType: String(data.get("employmentType") ?? ""),
      description: String(data.get("description") ?? ""),
    };

    try {
      const res = await fetch("/api/jobs/post", {
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
          Request submitted
        </h2>
        <p className="max-w-md text-sm text-mist-dim">{serverMessage}</p>
        <Button variant="outline" onClick={() => setStatus("idle")} className="mt-2">
          Submit another job
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard as="section">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Job title</Label>
            <Input id="title" name="title" aria-invalid={Boolean(errors.title)} />
            {errors.title && <FieldError message={errors.title} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" aria-invalid={Boolean(errors.company)} />
            {errors.company && <FieldError message={errors.company} />}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            aria-invalid={Boolean(errors.contactEmail)}
          />
          {errors.contactEmail && <FieldError message={errors.contactEmail} />}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Remote, or a city"
              aria-invalid={Boolean(errors.location)}
            />
            {errors.location && <FieldError message={errors.location} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employmentType">Employment type</Label>
            <Input
              id="employmentType"
              name="employmentType"
              placeholder="Full-time, contract, etc."
              aria-invalid={Boolean(errors.employmentType)}
            />
            {errors.employmentType && <FieldError message={errors.employmentType} />}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={6}
            aria-invalid={Boolean(errors.description)}
            placeholder="Responsibilities, requirements, and how to apply"
          />
          {errors.description && <FieldError message={errors.description} />}
        </div>

        <p className="text-sm text-mist-dim">
          Submissions are reviewed by the GN Labs team and require admin
          approval before they appear on the job board.
        </p>

        {status === "error" && serverMessage && Object.keys(errors).length === 0 && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            {serverMessage}
          </p>
        )}

        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-fit px-6">
          {status === "submitting" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {status === "submitting" ? "Submitting" : "Submit for review"}
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
