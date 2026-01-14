#!/usr/bin/env npx tsx
/**
 * Mock Validator
 * 
 * Validates that all mocks in the registry are correctly referenced
 * in their corresponding source files.
 * 
 * Usage: npx ts-node scripts/validate-mocks.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface MockDefinition {
    windowKey: string;
    usedIn: string[];
}

interface ValidationResult {
    mock: string;
    status: 'OK' | 'WARNING' | 'ERROR';
    message: string;
}

// Import mock registry (relative to project root)
const MOCK_REGISTRY: Record<string, MockDefinition> = {
    user: {
        windowKey: '__mockUser',
        usedIn: ['src/hooks/useUser.ts'],
    },
    autoCheckIn: {
        windowKey: '__mockAutoCheckIn',
        usedIn: ['src/features/strength/hooks/useMiningSession.ts'],
    },
    coopSession: {
        windowKey: '__mockCoOpSession',
        usedIn: ['src/services/coop/CoOpService.ts', 'src/features/coop/LiveSessionHUD.tsx'],
    },
    sessions: {
        windowKey: '__mockSessions',
        usedIn: ['src/services/coop/CoOpService.ts'],
    },
    ghostEvents: {
        windowKey: '__mockGhostEvents',
        usedIn: ['src/features/coop/GhostOverlay.tsx'],
    },
};

function validateMocks(): ValidationResult[] {
    const results: ValidationResult[] = [];
    const projectRoot = process.cwd();

    for (const [mockName, config] of Object.entries(MOCK_REGISTRY)) {
        for (const filePath of config.usedIn) {
            const fullPath = path.join(projectRoot, filePath);

            if (!fs.existsSync(fullPath)) {
                results.push({
                    mock: mockName,
                    status: 'ERROR',
                    message: `File not found: ${filePath}`,
                });
                continue;
            }

            const content = fs.readFileSync(fullPath, 'utf-8');

            if (!content.includes(config.windowKey)) {
                results.push({
                    mock: mockName,
                    status: 'WARNING',
                    message: `${config.windowKey} not found in ${filePath}`,
                });
            } else {
                results.push({
                    mock: mockName,
                    status: 'OK',
                    message: `${config.windowKey} correctly referenced in ${filePath}`,
                });
            }
        }
    }

    return results;
}

function printResults(results: ValidationResult[]): void {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           🔍 MOCK REGISTRY VALIDATION                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    const errors = results.filter(r => r.status === 'ERROR');
    const warnings = results.filter(r => r.status === 'WARNING');
    const ok = results.filter(r => r.status === 'OK');

    for (const result of results) {
        const icon = result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`${icon} [${result.mock}] ${result.message}`);
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`Summary: ${ok.length} OK | ${warnings.length} Warnings | ${errors.length} Errors`);

    if (errors.length > 0) {
        console.log('\n⛔ VALIDATION FAILED - Fix errors before pushing\n');
        process.exit(1);
    } else if (warnings.length > 0) {
        console.log('\n⚠️ VALIDATION PASSED WITH WARNINGS\n');
        process.exit(0);
    } else {
        console.log('\n✅ ALL MOCKS VALIDATED SUCCESSFULLY\n');
        process.exit(0);
    }
}

// Main
const results = validateMocks();
printResults(results);
