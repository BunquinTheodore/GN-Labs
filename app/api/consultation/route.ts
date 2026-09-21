import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  appendConsultationRequest,
  type ConsultationRequest,
} from "@/lib/jobs";
import { renderNotificationEmail, sendTeamNotification } from "@/lib/email";

export interface ConsultationPayload {
  name: string;
  company: string;
  email: string;
  automationGoal: string;
  budgetRange?: string;
  preferredDate?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldErrors(body: Partial<ConsultationPayload>) {
  const errors: Partial<Record<keyof ConsultationPayload, string>> = {};

  if (!body.name || !body.name.trim()) {
    errors.name = "Name is required.";
  }
  if (!body.company || !body.company.trim()) {
    errors.company = "Company is required.";
  }
  if (!body.email || !body.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(body.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!body.automationGoal || !body.automationGoal.trim()) {
    errors.automationGoal =
      "Tell us what you want to automate or integrate.";
  }

  return errors;
}

// This route persists submissions to Firestore (see lib/jobs.ts /
// lib/firebase-admin.ts) and emails the team inbox via Resend (lib/email.ts)
// so a submission is not only findable in the database. It does not write
// to a CRM or book a calendar slot — replace with a real booking/CRM
// integration before launch if that's needed.
export async function POST(request: Request) {
  let body: Partial<ConsultationPayload>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const errors = fieldErrors(body);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, message: "Please fix the highlighted fields.", errors },
      { status: 400 }
    );
  }

  const record: ConsultationRequest = {
    id: randomUUID(),
    name: body.name!.trim(),
    company: body.company!.trim(),
    email: body.email!.trim(),
    automationGoal: body.automationGoal!.trim(),
    budgetRange: body.budgetRange?.trim() || undefined,
    preferredDate: body.preferredDate?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  };

  try {
    await appendConsultationRequest(record);
  } catch (error) {
    console.error(
      "[consultation] could not write to Firestore",
      { id: record.id },
      error
    );
    return NextResponse.json(
      {
        success: false,
        message:
          "We could not save your submission right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }

  console.log("[consultation] submission received", {
    id: record.id,
    at: record.submittedAt,
    hasBudgetRange: Boolean(body.budgetRange),
    hasPreferredDate: Boolean(body.preferredDate),
    automationGoalLength: body.automationGoal?.trim().length ?? 0,
  });

  const emailed = await sendTeamNotification({
    subject: `New consultation request: ${record.company}`,
    html: renderNotificationEmail("New consultation / automation inquiry", [
      ["Name", record.name],
      ["Company", record.company],
      ["Email", record.email],
      ["Automation goal", record.automationGoal],
      ["Budget range", record.budgetRange],
      ["Preferred date", record.preferredDate],
      ["Submitted at", record.submittedAt],
    ]),
  });
  if (!emailed) {
    console.warn("[consultation] team notification email not sent", {
      id: record.id,
    });
  }

  return NextResponse.json({
    success: true,
    message:
      "Thanks. Your consultation request has been received. We will reach out by email to confirm a time.",
  });
}
