/**
 * External Intelligence Parser for CI Doctor v3.0.
 *
 * Extracts failure targets and repair protocols from GitHub App comments
 * and status checks: CodeRabbit, Snyk, CodeFactor, Codecov, Dependabot,
 * Lighthouse, Chromatic, OSSF Scorecard.
 *
 * Usage: gh pr view <PR> --json comments,statusCheckRollup | npx tsx scripts/app-intelligence.ts [--json]
 */
import * as fs from 'fs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Comment {
    author: { login: string };
    body: string;
}

interface StatusCheck {
    name?: string;
    context?: string;
    state?: string;
    conclusion?: string;
    targetUrl?: string;
    description?: string;
}

interface PRData {
    comments: Comment[];
    statusCheckRollup: StatusCheck[];
}

interface IntelligenceResult {
    targets: string[];
    protocols: string[];
    suggestions: Suggestion[];
    sources: string[];
}

interface Suggestion {
    source: string;
    type: 'fix' | 'warning' | 'info';
    message: string;
    files: string[];
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseCodeRabbit(comments: Comment[]): Partial<IntelligenceResult> {
    const targets = new Set<string>();
    const protocols = new Set<string>();
    const suggestions: Suggestion[] = [];

    for (const comment of comments) {
        if (comment.author.login !== 'coderabbitai') continue;
        const body = comment.body;

        // Merge conflicts
        if (body.includes('Merge conflicts detected') || body.includes('merge conflict')) {
            protocols.add('MERGE_CONFLICT');
            const conflictMatch = body.match(/⚔️ `([^`]+)`/g);
            if (conflictMatch) {
                conflictMatch.forEach(m => targets.add(m.replace(/⚔️ `|`/g, '')));
            }
        }

        // AI repair suggestions — extract actionable fix prompts
        const actionableBlocks = body.match(/```suggestion[\s\S]*?```/g);
        if (actionableBlocks) {
            for (const block of actionableBlocks) {
                suggestions.push({
                    source: 'CodeRabbit',
                    type: 'fix',
                    message: block.replace(/```suggestion\n?|```/g, '').trim(),
                    files: [],
                });
            }
        }

        // File-specific feedback
        const fileRefs = body.match(/`([^`]+\.(ts|tsx|js|jsx|css|yml))`/g);
        if (fileRefs) {
            fileRefs.forEach(f => targets.add(f.replace(/`/g, '')));
        }

        // Quality issues
        if (body.includes('complexity') || body.includes('refactor')) {
            protocols.add('STATIC_ANALYSIS_FAIL');
        }
    }

    return { targets: [...targets], protocols: [...protocols], suggestions };
}

function parseSnyk(comments: Comment[]): Partial<IntelligenceResult> {
    const protocols = new Set<string>();
    const suggestions: Suggestion[] = [];

    for (const comment of comments) {
        if (!comment.author.login.includes('snyk')) continue;
        const body = comment.body;

        if (body.includes('vulnerability') || body.includes('CVE-')) {
            protocols.add('SECURITY_BREACH');

            const cveMatch = body.match(/CVE-\d{4}-\d+/g);
            const pkgMatch = body.match(/`([^`]+)`.*?(vulnerability|critical|high)/gi);

            suggestions.push({
                source: 'Snyk',
                type: 'warning',
                message: `Security vulnerabilities detected: ${cveMatch?.join(', ') || 'see report'}`,
                files: pkgMatch?.map(m => m.match(/`([^`]+)`/)?.[1] || '').filter(Boolean) || [],
            });
        }
    }

    return { protocols: [...protocols], suggestions };
}

function parseCodecov(comments: Comment[]): Partial<IntelligenceResult> {
    const targets = new Set<string>();
    const protocols = new Set<string>();
    const suggestions: Suggestion[] = [];

    for (const comment of comments) {
        if (comment.author.login !== 'codecov' && !comment.author.login.includes('codecov')) continue;
        const body = comment.body;

        if (body.includes('coverage')) {
            protocols.add('COVERAGE_DROP');

            // Extract files with decreased coverage
            const fileMatch = body.match(/\[([^\]]+\.tsx?)\]/g);
            const uncoveredFiles: string[] = [];
            if (fileMatch) {
                fileMatch.forEach(m => {
                    const file = m.replace(/[[\]]/g, '');
                    targets.add(file);
                    uncoveredFiles.push(file);
                });
            }

            // Extract coverage percentage
            const pctMatch = body.match(/(\d+\.?\d*)%/);
            suggestions.push({
                source: 'Codecov',
                type: 'warning',
                message: `Coverage ${pctMatch ? `at ${pctMatch[1]}%` : 'decreased'}. Files needing tests: ${uncoveredFiles.join(', ') || 'see report'}`,
                files: uncoveredFiles,
            });
        }
    }

    return { targets: [...targets], protocols: [...protocols], suggestions };
}

function parseCodeFactor(comments: Comment[]): Partial<IntelligenceResult> {
    const protocols = new Set<string>();
    const suggestions: Suggestion[] = [];

    for (const comment of comments) {
        if (comment.author.login !== 'codefactor' && !comment.author.login.includes('codefactor')) continue;

        if (comment.body.includes('problems') || comment.body.includes('issues found')) {
            protocols.add('STATIC_ANALYSIS_FAIL');
            suggestions.push({
                source: 'CodeFactor',
                type: 'warning',
                message: 'Static analysis issues detected. Review CodeFactor report.',
                files: [],
            });
        }
    }

    return { protocols: [...protocols], suggestions };
}

function parseDependabot(comments: Comment[]): Partial<IntelligenceResult> {
    const suggestions: Suggestion[] = [];
    const protocols = new Set<string>();

    for (const comment of comments) {
        if (comment.author.login !== 'dependabot[bot]' && !comment.author.login.includes('dependabot')) continue;

        const pkgMatch = comment.body.match(/Bumps \[([^\]]+)\]/);
        if (pkgMatch) {
            suggestions.push({
                source: 'Dependabot',
                type: 'info',
                message: `Dependency update available: ${pkgMatch[1]}`,
                files: ['package.json'],
            });
        }

        if (comment.body.includes('security') || comment.body.includes('vulnerability')) {
            protocols.add('SECURITY_BREACH');
        }
    }

    return { protocols: [...protocols], suggestions };
}

// ---------------------------------------------------------------------------
// Status Check Parsers
// ---------------------------------------------------------------------------

function parseStatusChecks(checks: StatusCheck[]): Partial<IntelligenceResult> {
    const protocols = new Set<string>();
    const suggestions: Suggestion[] = [];

    for (const check of checks) {
        const name = (check.name || check.context || '').toLowerCase();
        const conclusion = (check.conclusion || check.state || '').toLowerCase();

        if (conclusion !== 'failure' && conclusion !== 'error') continue;

        // Lighthouse CI
        if (name.includes('lighthouse') || name.includes('lhci')) {
            protocols.add('PERF_DEGRADATION');
            suggestions.push({
                source: 'Lighthouse CI',
                type: 'warning',
                message: `Lighthouse check failed: ${check.description || 'performance budget exceeded'}`,
                files: [],
            });
        }

        // Chromatic
        if (name.includes('chromatic')) {
            protocols.add('VISUAL_REGRESSION');
            suggestions.push({
                source: 'Chromatic',
                type: 'warning',
                message: `Visual regression detected: ${check.description || 'component changes need review'}`,
                files: [],
            });
        }

        // Scorecard
        if (name.includes('scorecard') || name.includes('ossf')) {
            suggestions.push({
                source: 'OSSF Scorecard',
                type: 'info',
                message: `Supply chain security check failed: ${check.description || 'see Scorecard report'}`,
                files: [],
            });
        }

        // Qodana
        if (name.includes('qodana')) {
            protocols.add('STATIC_ANALYSIS_FAIL');
            suggestions.push({
                source: 'Qodana',
                type: 'warning',
                message: `Static analysis failed: ${check.description || 'code quality issues'}`,
                files: [],
            });
        }
    }

    return { protocols: [...protocols], suggestions };
}

// ---------------------------------------------------------------------------
// Main Parser
// ---------------------------------------------------------------------------

export function parseAppIntelligence(data: PRData): IntelligenceResult {
    const allTargets = new Set<string>();
    const allProtocols = new Set<string>();
    const allSuggestions: Suggestion[] = [];
    const sources = new Set<string>();

    const parsers = [
        { name: 'CodeRabbit', fn: () => parseCodeRabbit(data.comments) },
        { name: 'Snyk', fn: () => parseSnyk(data.comments) },
        { name: 'Codecov', fn: () => parseCodecov(data.comments) },
        { name: 'CodeFactor', fn: () => parseCodeFactor(data.comments) },
        { name: 'Dependabot', fn: () => parseDependabot(data.comments) },
        { name: 'StatusChecks', fn: () => parseStatusChecks(data.statusCheckRollup || []) },
    ];

    for (const parser of parsers) {
        const result = parser.fn();
        if (result.targets) result.targets.forEach(t => allTargets.add(t));
        if (result.protocols) result.protocols.forEach(p => allProtocols.add(p));
        if (result.suggestions && result.suggestions.length > 0) {
            allSuggestions.push(...result.suggestions);
            sources.add(parser.name);
        }
    }

    return {
        targets: Array.from(allTargets),
        protocols: Array.from(allProtocols),
        suggestions: allSuggestions,
        sources: Array.from(sources),
    };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const input = fs.readFileSync(0, 'utf-8');
const data = JSON.parse(input);
const result = parseAppIntelligence(data);

console.log(JSON.stringify(result, null, 2));
