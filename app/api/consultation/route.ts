import { NextResponse } from "next/server";

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

// Placeholder backend: this route does not send email, write to a CRM, or
// book a calendar slot. It validates the submission and logs metadata only
// (field presence and lengths, never the raw message or contact details)
// so no real integration is implied. Replace with a real booking/CRM
// integration before launch.
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

  console.log("[consultation] submission received", {
    at: new Date().toISOString(),
    hasBudgetRange: Boolean(body.budgetRange),
    hasPreferredDate: Boolean(body.preferredDate),
    automationGoalLength: body.automationGoal?.trim().length ?? 0,
  });

  return NextResponse.json({
    success: true,
    message:
      "Thanks. Your consultation request has been received. We will reach out by email to confirm a time.",
  });
}
