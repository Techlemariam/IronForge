/**
 * Annotation Engine for CI Doctor God Mode.
 * Posts failure diagnostics as inline code annotations via GitHub Checks API.
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface Annotation {
    path: string;
    start_line: number;
    end_line: number;
    annotation_level: 'notice' | 'warning' | 'failure';
    message: string;
    title: string;
}

function getHeadSha(): string {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch (e) {
        return '';
    }
}

function getCheckRunId(sha: string): string {
    try {
        // Fetch the check run associated with the current SHA
        const output = execSync(`gh api repos/:owner/:repo/commits/${sha}/check-runs --jq ".check_runs[0].id"`).toString().trim();
        return output;
    } catch (e) {
        console.error('Failed to fetch check run ID');
        return '';
    }
}

function postAnnotations(checkRunId: string, annotations: Annotation[]) {
    if (annotations.length === 0) return;

    // GitHub limits annotations to 50 per request
    const chunks = [];
    for (let i = 0; i < annotations.length; i += 50) {
        chunks.push(annotations.slice(i, i + 50));
    }

    chunks.forEach(chunk => {
        const payload = {
            output: {
                title: '🩺 CI Doctor Diagnostics',
                summary: 'Categorized failures and suggested fixes.',
                annotations: chunk
            }
        };

        const tmpFile = path.join(process.cwd(), '.agent/tmp-annotations.json');
        fs.writeFileSync(tmpFile, JSON.stringify(payload));

        try {
            execSync(`gh api -X PATCH repos/:owner/:repo/check-runs/${checkRunId} --input "${tmpFile}"`);
            console.log(`✅ Posted ${chunk.length} annotations to check run ${checkRunId}`);
        } catch (e) {
            console.error('Failed to post annotations:', e);
        } finally {
            if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
        }
    });
}

function main() {
    const sha = getHeadSha();
    if (!sha) return;

    const checkRunId = getCheckRunId(sha);
    if (!checkRunId) {
        console.log('No active check run found for SHA:', sha);
        return;
    }

    try {
        // Read intelligence and diagnostics
        const diagPath = path.resolve('.agent/reports/ci-diagnosis.json');
        const intelPath = path.resolve('.agent/reports/app-intelligence.json');

        if (!fs.existsSync(diagPath)) {
            console.log('No diagnostics found at .agent/reports/ci-diagnosis.json');
            return;
        }

        const diagnostics = JSON.parse(fs.readFileSync(diagPath, 'utf-8'));
        const intelligence = fs.existsSync(intelPath) ? JSON.parse(fs.readFileSync(intelPath, 'utf-8')) : { targets: [] };

        const annotations: Annotation[] = [];

        diagnostics.results.forEach((res: any) => {
            // Apply diagnostics to identified targets, or fallback to root if none
            const targets = intelligence.targets.length > 0 ? intelligence.targets : ['package.json'];

            targets.forEach((target: string) => {
                annotations.push({
                    path: target,
                    start_line: 1, // Fallback to line 1 if no specific line info
                    end_line: 1,
                    annotation_level: res.confidence === 'HIGH' ? 'failure' : 'warning',
                    title: `🩺 CI Doctor: ${res.category}`,
                    message: `${res.description}\n\nFIX: ${res.solution}`
                });
            });
        });

        postAnnotations(checkRunId, annotations);
    } catch (e) {
        console.error('Error in main:', e);
    }
}

main();
