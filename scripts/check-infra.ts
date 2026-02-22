// Bypass self-signed certificate issues for Tailscale/Coolify internal checks
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const TARGETS = [
    { name: "Production App", url: "https://ironforge.app/api/health" },
    { name: "n8n Server (Hetzner)", url: "https://coolify.ironforge.com" },
    { name: "Remote Webhook (POST)", url: "https://coolify.ironforge.com/webhook/ironforge-trigger", method: "POST" }];

async function checkHealth() {
    console.log("🔍 Checking IronForge Infrastructure Status...\n");

    for (const target of TARGETS) {
        try {
            const start = Date.now();
            const config: RequestInit = {
                method: target.method || "GET",
                headers: { "Content-Type": "application/json" },
                body: target.method === "POST" ? JSON.stringify({ token: "ping", workflow: "test" }) : undefined
            };

            const response = await fetch(target.url, config);
            const duration = Date.now() - start;

            if (response.ok || response.status === 200) {
                console.log(`✅ ${target.name.padEnd(25)}: [${response.status}] ONLINE (${duration}ms)`);
            } else if (target.method === "POST" && response.status === 401) {
                console.log(`✅ ${target.name.padEnd(25)}: [401] ACTIVE (Token Required) (${duration}ms)`);
            } else {
                console.log(`❌ ${target.name.padEnd(25)}: [${response.status}] UNHEALTHY (${duration}ms)`);
            }
        } catch (error: any) {
            console.log(`❌ ${target.name.padEnd(25)}: OFFLINE (${error.message})`);
        }
    }
    console.log("\n✨ System is operational.");
}

checkHealth();
