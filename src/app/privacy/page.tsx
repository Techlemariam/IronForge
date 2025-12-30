import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | IronForge",
  description: "Privacy Policy for the IronForge fitness RPG application.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">
        Privacy Policy
      </h1>
      <p className="text-sm text-zinc-400 mb-8">
        Last updated: December 24, 2025
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          1. Information We Collect
        </h2>
        <p className="text-zinc-300 leading-relaxed">
          IronForge collects the following information to provide our fitness
          gamification service:
        </p>
        <ul className="list-disc list-inside mt-2 text-zinc-300 space-y-1">
          <li>Email address (for account authentication)</li>
          <li>
            Workout data synced from third-party services (Hevy, Intervals.icu)
          </li>
          <li>In-app progress and game statistics</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          2. How We Use Your Information
        </h2>
        <p className="text-zinc-300 leading-relaxed">
          We use your information solely to provide the IronForge service,
          including:
        </p>
        <ul className="list-disc list-inside mt-2 text-zinc-300 space-y-1">
          <li>Syncing and displaying your workout data</li>
          <li>Calculating XP, levels, and in-game rewards</li>
          <li>
            Providing personalized training recommendations via our AI Oracle
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
        <p className="text-zinc-300 leading-relaxed">
          We do not sell your personal data. We share data only with:
        </p>
        <ul className="list-disc list-inside mt-2 text-zinc-300 space-y-1">
          <li>Supabase (authentication and database hosting)</li>
          <li>Vercel (application hosting)</li>
          <li>Google AI (for Oracle recommendations, anonymized)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          4. Data Retention & Deletion
        </h2>
        <p className="text-zinc-300 leading-relaxed">
          You can delete your account and all associated data at any time from
          the Settings menu within the app. Upon deletion, all your data is
          permanently removed from our systems.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Contact</h2>
        <p className="text-zinc-300 leading-relaxed">
          For privacy-related inquiries, contact us at:{" "}
          <a
            href="mailto:privacy@ironforge.app"
            className="text-orange-400 hover:underline"
          >
            privacy@ironforge.app
          </a>
        </p>
      </section>
    </main>
  );
}
