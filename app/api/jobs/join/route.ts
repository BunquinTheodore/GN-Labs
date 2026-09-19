import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendTalentSignup, type TalentSignup } from "@/lib/jobs";

interface JoinTalentBody {
  name?: string;
  email?: string;
  role?: string;
  skills?: string;
  linkUrl?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldErrors(body: JoinTalentBody) {
  const errors: Partial<Record<keyof JoinTalentBody, string>> = {};

  if (!body.name?.trim()) errors.name = "Name is required.";
  if (!body.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(body.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!body.role?.trim()) errors.role = "Role or specialty is required.";

  return errors;
}

// Filesystem-backed placeholder store. See PLAN.md for the tradeoffs of
// this approach and the honest fallback behavior below.
export async function POST(request: Request) {
  let body: JoinTalentBody;

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

  const record: TalentSignup = {
    id: randomUUID(),
    name: body.name!.trim(),
    email: body.email!.trim(),
    role: body.role!.trim(),
    skills: body.skills?.trim() || undefined,
    linkUrl: body.linkUrl?.trim() || undefined,
    submittedAt: new Date().toISOString(),
  };

  try {
    await appendTalentSignup(record);
  } catch (error) {
    console.error(
      "[jobs/join] could not write to data/talent.json; logging placeholder instead",
      { id: record.id, role: record.role },
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

  console.log("[jobs/join] talent signup stored", {
    id: record.id,
    submittedAt: record.submittedAt,
  });

  return NextResponse.json({
    success: true,
    message: "You're on the talent list. We'll reach out when a fitting role comes up.",
  });
}
