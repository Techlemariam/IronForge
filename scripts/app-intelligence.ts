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

    data.comments.forEach(comment => {
        const body = comment.body;
        const author = comment.author.login;

        // CodeRabbit: Merge Conflicts
        if (author === 'coderabbitai' && body.includes('Merge conflicts detected')) {
            protocols.add('MERGE_CONFLICT_PROTOCOL');
            const conflictMatch = body.match(/⚔️ `([^`]+)`/g);
            if (conflictMatch) {
                conflictMatch.forEach(m => targets.add(m.replace(/⚔️ `|`/g, '')));
            }
        }

        // Qodana / CodeFactor: Static Analysis
        if ((author.includes('qodana') || author === 'codefactor') && body.includes('problems')) {
            protocols.add('STATIC_ANALYSIS_FAIL');
        }

        // Codecov: Coverage
        if (author === 'codecov' && body.includes('coverage')) {
            protocols.add('COVERAGE_DROP');
            const fileMatch = body.match(/\[([^\]]+\.tsx?)\]/g);
            if (fileMatch) {
                fileMatch.forEach(m => targets.add(m.replace(/[\[\]]/g, '')));
            }
        }
    });

    return {
        targets: Array.from(targets),
        protocols: Array.from(protocols)
    };
}

const input = fs.readFileSync(0, 'utf-8');
const data = JSON.parse(input);
const result = parseAppIntelligence(data);

console.log(JSON.stringify(result, null, 2));
