import type { Metadata } from "next";
import { TalentJoinForm } from "@/components/talent-join-form";

export const metadata: Metadata = {
  title: "Join the Talent List | GN Labs",
  description:
    "Add yourself to the GN Labs talent list to hear about roles that fit.",
};

export default function JoinTalentPage() {
  return (
    <div className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-mist sm:text-5xl">
          Join the talent list
        </h1>
        <p className="mt-4 text-base text-mist-dim sm:text-lg">
          Tell us about yourself and we will reach out directly when a role
          on the board fits.
        </p>

        <div className="mt-10">
          <TalentJoinForm />
        </div>
      </div>
    </div>
  );
}
