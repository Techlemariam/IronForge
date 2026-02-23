// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getQuota, trackUsage, setQuotaFilePath } from '../quota-manager.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('quota-manager', () => {
    let tempFile: string;

    beforeEach(() => {
        // Create a temp file path unique for each test
        const tempDir = os.tmpdir();
        tempFile = path.join(tempDir, `quota_usage_${Date.now()}_${Math.random().toString(36).substring(7)}.json`);
        setQuotaFilePath(tempFile);
    });

    afterEach(() => {
        // Cleanup
        if (fs.existsSync(tempFile)) {
            try {
                fs.unlinkSync(tempFile);
            } catch (_e) {
                // Ignore
            }
        }
    });

    describe('getQuota', () => {
        it('should return healthy status when quota file does not exist', () => {
            const result = getQuota();

            expect(result).toEqual({
                used: 0,
                remaining: 1500,
                percentUsed: 0,
                status: 'Healthy',
                source: 'antigravity'
            });
        });

        it('should return healthy status for new day', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const oldData = {
                date: yesterday.toISOString().split('T')[0],
                count: 1000
            };

            fs.writeFileSync(tempFile, JSON.stringify(oldData));

            const result = getQuota();

            expect(result).toEqual({
                used: 0,
                remaining: 1500,
                percentUsed: 0,
                status: 'Healthy',
                source: 'antigravity'
            });
        });

        it('should return warning status when usage > 75%', () => {
            const today = new Date().toISOString().split('T')[0];
            const data = {
                date: today,
                count: 1200 // 80% of 1500
            };

            fs.writeFileSync(tempFile, JSON.stringify(data));

            const result = getQuota();

            expect(result.status).toBe('Warning');
            expect(result.percentUsed).toBe(80);
            expect(result.source).toBe('antigravity');
        });

        it('should return healthy status when usage < 75%', () => {
            const today = new Date().toISOString().split('T')[0];
            const data = {
                date: today,
                count: 750 // 50% of 1500
            };

            fs.writeFileSync(tempFile, JSON.stringify(data));

            const result = getQuota();

            expect(result.status).toBe('Healthy');
            expect(result.percentUsed).toBe(50);
        });

        it('should return healthy/default status on error (corrupted file)', () => {
            fs.writeFileSync(tempFile, 'invalid-json');

            const result = getQuota();

            expect(result.status).toBe('Healthy');
            expect(result.source).toBe('unknown');
        });
    });

    describe('trackUsage', () => {
        it('should create new quota file for today', () => {
            const today = new Date().toISOString().split('T')[0];

            const result = trackUsage(1);

            expect(fs.existsSync(tempFile)).toBe(true);
            const writtenData = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
            expect(writtenData.date).toBe(today);
            expect(writtenData.count).toBe(1);
            expect(result.used).toBe(1);
        });

        it('should increment existing quota for today', () => {
            const today = new Date().toISOString().split('T')[0];
            const existingData = {
                date: today,
                count: 42
            };

            fs.writeFileSync(tempFile, JSON.stringify(existingData));

            const result = trackUsage(1);

            const writtenData = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
            expect(writtenData.count).toBe(43);
            expect(result.used).toBe(43);
        });

        it('should reset quota for new day', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const oldData = {
                date: yesterday.toISOString().split('T')[0],
                count: 1400
            };

            fs.writeFileSync(tempFile, JSON.stringify(oldData));

            const result = trackUsage(5);

            const writtenData = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
            expect(writtenData.count).toBe(5);
            expect(result.used).toBe(5);
        });

        it('should create directory if it does not exist', () => {
            // Use a subdirectory in temp
            const subDir = path.join(os.tmpdir(), `subdir_${Date.now()}_${Math.random().toString(36).substring(7)}`);
            const deepFile = path.join(subDir, 'quota.json');
            setQuotaFilePath(deepFile);

            try {
                trackUsage(1);
                expect(fs.existsSync(subDir)).toBe(true);
            } finally {
                if (fs.existsSync(deepFile)) fs.unlinkSync(deepFile);
                if (fs.existsSync(subDir)) fs.rmdirSync(subDir);
            }
        });

        it('should handle custom increment values', () => {
            trackUsage(10);

            const writtenData = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
            expect(writtenData.count).toBe(10);
        });
    });
});
