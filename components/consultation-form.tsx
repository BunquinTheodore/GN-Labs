"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassCard } from "@/components/glass-card";

type FieldErrors = Record<string, string>;

const budgetRanges = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-15k", label: "$5,000 to $15,000" },
  { value: "15k-50k", label: "$15,000 to $50,000" },
  { value: "50k-plus", label: "$50,000+" },
  { value: "not-sure", label: "Not sure yet" },
];

export function ConsultationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [budgetRange, setBudgetRange] = useState<string | null>(null);
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
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      automationGoal: String(data.get("automationGoal") ?? ""),
      budgetRange: String(data.get("budgetRange") ?? "") || undefined,
      preferredDate: String(data.get("preferredDate") ?? "") || undefined,
    };

    try {
      const res = await fetch("/api/consultation", {
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
      setBudgetRange(null);
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
          Request received
        </h2>
        <p className="max-w-md text-sm text-mist-dim">{serverMessage}</p>
        <Button variant="outline" onClick={() => setStatus("idle")} className="mt-2">
          Submit another request
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
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              autoComplete="organization"
              aria-invalid={Boolean(errors.company)}
            />
            {errors.company && <FieldError message={errors.company} />}
          </div>
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="automationGoal">
            What do you want to automate or integrate?
          </Label>
          <Textarea
            id="automationGoal"
            name="automationGoal"
            rows={5}
            aria-invalid={Boolean(errors.automationGoal)}
            placeholder="e.g. Route inbound support emails to the right team and draft a first response"
          />
          {errors.automationGoal && <FieldError message={errors.automationGoal} />}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budgetRange">Budget range (optional)</Label>
            <Select
              name="budgetRange"
              value={budgetRange}
              onValueChange={(value) => setBudgetRange(value as string)}
            >
              <SelectTrigger id="budgetRange" className="w-full">
                <SelectValue placeholder="Select a range" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferredDate">Preferred date (optional)</Label>
            <Input id="preferredDate" name="preferredDate" type="date" />
          </div>
        </div>

        {status === "error" && serverMessage && Object.keys(errors).length === 0 && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            {serverMessage}
          </p>
        )}

        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-fit px-6">
          {status === "submitting" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {status === "submitting" ? "Sending" : "Book a Consultation"}
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
