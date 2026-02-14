import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Checking for Service Role Key...");
const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (key) {
    console.log("✅ FOUND KEY (First 5 chars):", key.substring(0, 5) + "...");
} else {
    console.log("❌ NO SERVICE ROLE KEY FOUND.");
}

console.log("All Supabase Keys:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
