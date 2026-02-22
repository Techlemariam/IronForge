import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getQuota, trackUsage } from '../quota-manager.js';
import fs from 'fs';
// Mock fs module
vi.mock('fs');
describe('quota-manager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('getQuota', () => {
        it('should return healthy status when quota file does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            const result = getQuota();
            expect(result).toEqual({
                used: 0,
                remaining: 10000,
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
                count: 5000
            };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(oldData));
            const result = getQuota();
            expect(result).toEqual({
                used: 0,
                remaining: 10000,
                percentUsed: 0,
                status: 'Healthy',
                source: 'antigravity'
            });
        });
        it('should return warning status when usage > 75%', () => {
            const today = new Date().toISOString().split('T')[0];
            const data = {
                date: today,
                count: 8000 // 80% of 10000
            };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(data));
            const result = getQuota();
            expect(result.status).toBe('Warning');
            expect(result.percentUsed).toBe(80);
            expect(result.source).toBe('antigravity');
        });
        it('should return healthy status when usage < 75%', () => {
            const today = new Date().toISOString().split('T')[0];
            const data = {
                date: today,
                count: 5000 // 50% of 10000
            };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(data));
            const result = getQuota();
            expect(result.status).toBe('Healthy');
            expect(result.percentUsed).toBe(50);
        });
        it('should return monitoring status on error', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockImplementation(() => {
                throw new Error('Read error');
            });
            const result = getQuota();
            expect(result.status).toBe('Monitoring');
            expect(result.source).toBe('unknown');
        });
    });
    describe('trackUsage', () => {
        beforeEach(() => {
            vi.mocked(fs.existsSync).mockReturnValue(false);
            vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
            vi.mocked(fs.writeFileSync).mockReturnValue(undefined);
        });
        it('should create new quota file for today', () => {
            const today = new Date().toISOString().split('T')[0];
            const result = trackUsage(1);
            expect(fs.writeFileSync).toHaveBeenCalled();
            const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1]);
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
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existingData));
            const result = trackUsage(1);
            const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1]);
            expect(writtenData.count).toBe(43);
            expect(result.used).toBe(43);
        });
        it('should reset quota for new day', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const oldData = {
                date: yesterday.toISOString().split('T')[0],
                count: 9000
            };
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(oldData));
            const result = trackUsage(5);
            const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1]);
            expect(writtenData.count).toBe(5);
            expect(result.used).toBe(5);
        });
        it('should create directory if it does not exist', () => {
            vi.mocked(fs.existsSync).mockReturnValueOnce(false); // quota file
            vi.mocked(fs.existsSync).mockReturnValueOnce(false); // directory
            trackUsage(1);
            expect(fs.mkdirSync).toHaveBeenCalled();
        });
        it('should handle custom increment values', () => {
            trackUsage(10);
            const writtenData = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1]);
            expect(writtenData.count).toBe(10);
        });
    });
});
