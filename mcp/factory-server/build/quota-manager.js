import fs from 'fs';
import path from 'path';
// Tracking file path relative to project root
// Tracking file path relative to project root
let quotaFilePath = path.resolve(process.cwd(), '../../.agent/quota_usage.json');
const DAILY_LIMIT = 1500; // Google One AI Pro typical daily RPD limit
export function setQuotaFilePath(path) {
    quotaFilePath = path;
}
export function getQuota() {
    const today = new Date().toISOString().split('T')[0];
    if (!fs.existsSync(quotaFilePath)) {
        return { used: 0, remaining: DAILY_LIMIT, percentUsed: 0, status: 'Healthy', source: 'antigravity' };
    }
    try {
        const data = JSON.parse(fs.readFileSync(quotaFilePath, 'utf-8'));
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
    if (fs.existsSync(quotaFilePath)) {
        try {
            const fileContent = JSON.parse(fs.readFileSync(quotaFilePath, 'utf-8'));
            if (fileContent.date === today) {
                data = fileContent;
            }
        }
        catch {
            // If corrupted, reset
        }
    }
    data.count += increment;
    // Ensure directory exists
    const dir = path.dirname(quotaFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(quotaFilePath, JSON.stringify(data, null, 2));
    const percent = (data.count / DAILY_LIMIT) * 100;
    return {
        used: data.count,
        remaining: Math.max(0, DAILY_LIMIT - data.count),
        percentUsed: Math.round(percent),
        status: percent > 90 ? 'Critical' : percent > 75 ? 'Warning' : 'Healthy',
        source: 'antigravity'
    };
}
