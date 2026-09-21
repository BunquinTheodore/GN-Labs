import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendJobRequest, type JobRequest } from "@/lib/jobs";
import { renderNotificationEmail, sendTeamNotification } from "@/lib/email";

interface PostJobBody {
  title?: string;
  company?: string;
  contactEmail?: string;
  location?: string;
  employmentType?: string;
  description?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldErrors(body: PostJobBody) {
  const errors: Partial<Record<keyof PostJobBody, string>> = {};

  if (!body.title?.trim()) errors.title = "Job title is required.";
  if (!body.company?.trim()) errors.company = "Company is required.";
  if (!body.contactEmail?.trim()) {
    errors.contactEmail = "Contact email is required.";
  } else if (!EMAIL_RE.test(body.contactEmail.trim())) {
    errors.contactEmail = "Enter a valid email address.";
  }
  if (!body.location?.trim()) errors.location = "Location is required.";
  if (!body.employmentType?.trim())
    errors.employmentType = "Employment type is required.";
  if (!body.description?.trim() || body.description.trim().length < 30) {
    errors.description = "Add a description of at least 30 characters.";
  }

  return errors;
}

// Persisted to Firestore (see lib/jobs.ts / lib/firebase-admin.ts) and
// emailed to the team inbox via Resend (lib/email.ts) so a pending request
// doesn't sit unnoticed. Job requests land in the labs_job_requests
// collection with status "pending" and are not surfaced on /jobs until
// approved and copied into labs_jobs.
export async function POST(request: Request) {
  let body: PostJobBody;

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

  const record: JobRequest = {
    id: randomUUID(),
    title: body.title!.trim(),
    company: body.company!.trim(),
    contactEmail: body.contactEmail!.trim(),
    location: body.location!.trim(),
    employmentType: body.employmentType!.trim(),
    description: body.description!.trim(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  try {
    await appendJobRequest(record);
  } catch (error) {
    // Firestore write failed. Surface a plain error to the user instead of
    // pretending the submission was stored.
    console.error(
      "[jobs/post] could not write job request to Firestore",
      { id: record.id, title: record.title, company: record.company },
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

  console.log("[jobs/post] pending job request stored", {
    id: record.id,
    submittedAt: record.submittedAt,
  });

  const emailed = await sendTeamNotification({
    subject: `New job post request: ${record.title} at ${record.company}`,
    html: renderNotificationEmail("New job post request (pending approval)", [
      ["Title", record.title],
      ["Company", record.company],
      ["Contact email", record.contactEmail],
      ["Location", record.location],
      ["Employment type", record.employmentType],
      ["Description", record.description],
      ["Submitted at", record.submittedAt],
    ]),
  });
  if (!emailed) {
    console.warn("[jobs/post] team notification email not sent", {
      id: record.id,
    });
  }

  return NextResponse.json({
    success: true,
    message:
      "Thanks. Your job post request has been submitted and is pending admin approval before it goes live.",
  });
}
