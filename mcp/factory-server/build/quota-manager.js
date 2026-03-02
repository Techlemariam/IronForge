import fs from 'fs';
import path from 'path';
// Tracking file path relative to project root
const QUOTA_FILE_PATH = path.resolve(process.cwd(), '../../.agent/quota_usage.json');
const DAILY_LIMIT = 1500; // Google One AI Pro typical daily RPD limit
export function getQuota() {
    const today = new Date().toISOString().split('T')[0];
    if (!fs.existsSync(QUOTA_FILE_PATH)) {
        return { used: 0, remaining: DAILY_LIMIT, percentUsed: 0, status: 'Healthy', source: 'antigravity' };
    }
    try {
        const data = JSON.parse(fs.readFileSync(QUOTA_FILE_PATH, 'utf-8'));
        if (data.date !== today) {
            return { used: 0, remaining: DAILY_LIMIT, percentUsed: 0, status: 'Healthy', source: 'antigravity' };
        }
        const percent = (data.count / DAILY_LIMIT) * 100;
        return {
            used: data.count,
            remaining: Math.max(0, DAILY_LIMIT - data.count),
            percentUsed: Math.round(percent),
            status: percent > 90 ? 'Critical' : percent > 75 ? 'Warning' : 'Healthy',
            source: 'antigravity'
        };
    }
    catch (error) {
        console.error('Failed to read quota file:', error);
        return { used: 0, remaining: DAILY_LIMIT, percentUsed: 0, status: 'Healthy', source: 'unknown' };
    }
}
export function trackUsage(increment = 1) {
    const today = new Date().toISOString().split('T')[0];
    let data = { date: today, count: 0 };
    if (fs.existsSync(QUOTA_FILE_PATH)) {
        try {
            const fileContent = JSON.parse(fs.readFileSync(QUOTA_FILE_PATH, 'utf-8'));
            if (fileContent.date === today) {
                data = fileContent;
            }
        }
        catch (e) {
            // If corrupted, reset
        }
    }
    data.count += increment;
    // Ensure directory exists
    const dir = path.dirname(QUOTA_FILE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(QUOTA_FILE_PATH, JSON.stringify(data, null, 2));
    const percent = (data.count / DAILY_LIMIT) * 100;
    return {
        used: data.count,
        remaining: Math.max(0, DAILY_LIMIT - data.count),
        percentUsed: Math.round(percent),
        status: percent > 90 ? 'Critical' : percent > 75 ? 'Warning' : 'Healthy',
        source: 'antigravity'
    };
}
