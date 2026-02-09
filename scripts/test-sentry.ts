import * as Sentry from "@sentry/node";
import dotenv from "dotenv";

dotenv.config();

let dsn = process.env.SENTRY_DSN;

if (!dsn) {
    console.error("❌ SENTRY_DSN not found in .env");
    process.exit(1);
}

// Clean DSN (strip trailing dot if present)
if (dsn.endsWith('.')) {
    dsn = dsn.slice(0, -1);
}

console.log(`📡 Connecting to Sentry with DSN: ${dsn}`);

Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    debug: true,
});

async function main() {
    console.log("🚀 Sending test event to Sentry...");

    const eventId = Sentry.captureMessage("Sentry Connection Test - IronForge Remote", "info");

    console.log(`✅ Event sent! Event ID: ${eventId}`);

    // Wait for delivery
    console.log("⏳ Waiting 3 seconds for delivery...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Force flush
    await Sentry.close(2000);

    console.log("✨ Done!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error sending event:", err);
    process.exit(1);
});
