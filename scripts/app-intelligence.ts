/**
 * External Intelligence Parser for CI Doctor.
 * Extracts failure targets and repair protocols from GitHub App comments (CodeRabbit, Snyk, CodeFactor, Codecov).
 */
import * as fs from 'fs';

interface Comment {
    author: { login: string };
    body: string;
}

interface PRData {
    comments: Comment[];
    statusCheckRollup: any[];
}

function parseAppIntelligence(data: PRData) {
    const targets = new Set<string>();
    const protocols = new Set<string>();
    const aiAgentPrompts: string[] = [];

    data.comments.forEach(comment => {
        const body = comment.body;
        const author = (comment.author?.login || '').toLowerCase();

        // CodeRabbit: Merge Conflicts & Best Practices
        if (author.includes('coderabbit') && body.includes('review')) {
            if (body.includes('Merge conflicts')) {
                protocols.add('MERGE_CONFLICT_PROTOCOL');
            }

            // Extract "Prompt for AI Agents"
            const aiPromptMatch = body.match(/🤖 Prompt for AI Agents\s*\n+([\s\S]+?)(?:\n\n|###|$)/i);
            if (aiPromptMatch && aiPromptMatch[1]) {
                aiAgentPrompts.push(aiPromptMatch[1].trim());
            }

            // Extract file paths from backticks
            const fileMatch = body.match(/`([^`]+\.tsx?)`/g);
            if (fileMatch) {
                fileMatch.forEach(m => targets.add(m.replace(/`/g, '')));
            }
        }

        // Qodana / CodeFactor / Snyk: Static Analysis & Security
        if (author.includes('qodana') || author === 'codefactor' || author.includes('snyk')) {
            if (body.includes('problem') || body.includes('vulnerability') || body.includes('issue')) {
                protocols.add('STATIC_ANALYSIS_FAIL');
                if (author.includes('snyk')) {
                    protocols.add('SECURITY_BREACH');

                    // Extract patches: Fixed in [version]
                    const patchMatch = body.match(/Fixed in ([0-9]+\.[0-9]+\.[0-9]+)/);
                    if (patchMatch) {
                        protocols.add(`PATCH_AVAILABLE:${patchMatch[1]}`);
                    }
                }

                // Extract file paths from bullet points or bold text
                const pathMatch = body.match(/(?:\* |\*\*|`)([a-zA-Z0-9_\-\/]+\.tsx?)(?:\*\*|`|:)/g);
                if (pathMatch) {
                    pathMatch.forEach(m => {
                        const clean = m.replace(/[*`:]/g, '').trim();
                        if (clean.includes('.')) targets.add(clean);
                    });
                }
            }
        }

        // Codecov: Coverage
        if (author.includes('codecov') && body.includes('coverage')) {
            if (body.includes('decreased') || body.includes('drop')) {
                protocols.add('COVERAGE_DROP');
                const fileMatch = body.match(/\[([^\]]+\.tsx?)\]/g);
                if (fileMatch) {
                    fileMatch.forEach(m => targets.add(m.replace(/[\[\]]/g, '')));
                }
            }
        }
    });

    return {
        targets: Array.from(targets),
        protocols: Array.from(protocols),
        aiAgentPrompts
    };
}

try {
    const input = fs.readFileSync(0, 'utf-8');
    if (!input || input.trim() === '') {
        console.log(JSON.stringify({ targets: [], protocols: [] }));
    } else {
        const data = JSON.parse(input);
        const result = parseAppIntelligence(data);
        console.log(JSON.stringify(result, null, 2));
    }
} catch (e) {
    console.log(JSON.stringify({ targets: [], protocols: [] }));
}
