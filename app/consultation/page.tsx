import type { Metadata } from "next";
import { ConsultationForm } from "@/components/consultation-form";

export const metadata: Metadata = {
  title: "Book a Consultation | GN Labs",
  description:
    "Tell us what you want to automate or integrate. GN Labs will follow up to schedule a consultation.",
};

export default function ConsultationPage() {
  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl">
          Book a Consultation
        </h1>
        <p className="mt-4 text-base text-mist-dim sm:text-lg">
          Tell us a bit about your business and what you would like to
          automate or integrate. We will follow up by email to confirm a
          time.
        </p>

        <div className="mt-10">
          <ConsultationForm />
        </div>
      </div>
    </div>
  );
}
