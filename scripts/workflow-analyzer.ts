#!/usr/bin/env npx tsx
/**
 * Agent Workflow Analyzer
 *
 * Audits .agent/workflows/*.md files for:
 * 1. Metadata validity (frontmatter)
 * 2. Turbo optimization opportunities (auto-run safe commands)
 * 3. Skill usage consistency
 *
 * Usage:
 *   npx tsx scripts/workflow-analyzer.ts [--fix]
 */

import * as fs from 'fs';
import * as path from 'path';

const WORKFLOW_DIR = path.join(process.cwd(), '.agent', 'workflows');
const SKILL_DIR = path.join(process.cwd(), '.agent', 'skills');

interface Issue {
    file: string;
    line?: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'METADATA' | 'TURBO' | 'SKILL' | 'FORMAT';
    message: string;
    autoFixable: boolean;
}

interface WorkflowStats {
    total: number;
    optimized: number;
    issues: Issue[];
}

function parseFrontmatter(content: string): Record<string, any> | null {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;

    const yaml = match[1];
    const meta: Record<string, any> = {};

    yaml.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Handle arrays for skills
            if (key === 'skills') {
                const value = parts.slice(1).join(':').trim();
                // Remove brackets and split
                const cleanValue = value.replace(/^\[|\]$/g, '');
                meta[key] = cleanValue.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(s => s.length > 0);
            } else {
                const value = parts.slice(1).join(':').trim().replace(/^['"](.*)['"]$/, '$1'); // simple unquote
                meta[key] = value;
            }
        }
    });

    return meta;
}

function getKnownSkills(): Set<string> {
    const skills = new Set<string>();

    // 1. Standard Skills
    if (fs.existsSync(SKILL_DIR)) {
        const entries = fs.readdirSync(SKILL_DIR, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                skills.add(entry.name);
            }
        }
    }

    // 2. Github Workflows (treated as skills/capabilities)
    const githubWorkflowDir = path.join(process.cwd(), '.github', 'workflows');
    if (fs.existsSync(githubWorkflowDir)) {
        const entries = fs.readdirSync(githubWorkflowDir);
        for (const entry of entries) {
            if (entry.endsWith('.yml') || entry.endsWith('.yaml')) {
                skills.add(entry.replace('.yml', '').replace('.yaml', ''));
            }
        }
    }

    // 3. Agent Workflows (treated as skills/capabilities)
    if (fs.existsSync(WORKFLOW_DIR)) {
        const entries = fs.readdirSync(WORKFLOW_DIR);
        for (const entry of entries) {
            if (entry.endsWith('.md')) {
                skills.add(entry.replace('.md', ''));
            }
        }
    }

    // 4. Whitelisted Core Tools/Concepts
    skills.add('browser_subagent');
    skills.add('run_command');
    skills.add('npm'); // Core tool
    skills.add('pnpm'); // Core tool

    return skills;
}
function analyzeFile(filePath: string, fixMode: boolean, knownSkills: Set<string>): Issue[] {
    const issues: Issue[] = [];
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const filename = path.basename(filePath);

    // 1. Frontmatter Check
    const meta = parseFrontmatter(content);
    if (!meta) {
        issues.push({
            file: filename,
            severity: 'HIGH',
            type: 'FORMAT',
            message: 'Invalid or missing YAML frontmatter',
            autoFixable: false
        });
        return issues;
    }

    // Check required fields
    const required = ['description', 'command', 'category', 'trigger'];
    for (const field of required) {
        if (!meta[field]) {
            issues.push({
                file: filename,
                severity: 'HIGH',
                type: 'METADATA',
                message: `Missing frontmatter field: ${field}`,
                autoFixable: false
            });
        }
    }

    // Check command match
    const expectedCmd = `/${filename.replace('.md', '')}`;
    if (meta.command && meta.command !== expectedCmd) {
        // Soft warning, some files like INDEX.md might differ
        if (filename !== 'INDEX.md' && !filename.startsWith('monitor-')) {
            issues.push({
                file: filename,
                severity: 'LOW',
                type: 'METADATA',
                message: `Command '${meta.command}' matches filename (expected '${expectedCmd}')?`,
                autoFixable: true
            });
        }
    }

    // 2. Skill Validation
    const declaredSkills = new Set<string>(Array.isArray(meta.skills) ? meta.skills : []);
    const bodyContent = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, ''); // Remove frontmatter

    // Core tools that might be listed as skills but aren't in .agent/skills
    const coreTools = new Set(['browser_subagent', 'run_command', 'read_file', 'view_file', 'ask_user', 'notify_user', 'search_web']);

    // 2.1 check for invalid and unused skills
    for (const skill of declaredSkills) {
        if (!knownSkills.has(skill) && !coreTools.has(skill)) {
            issues.push({
                file: filename,
                severity: 'MEDIUM',
                type: 'SKILL',
                message: `Unknown skill declared: '${skill}'`,
                autoFixable: false
            });
            continue;
        }

        // Check usage (generous heuristic)
        // We assume usage if the skill name appears in the body OR a slash command /skill-name appears
        // Or if it's a common alias? For now, exact match.
        // We look for "skill-name" or "/skill-name"
        const regex = new RegExp(`\\b${skill}\\b|/${skill}`, 'i');
        if (!regex.test(bodyContent)) {
            issues.push({
                file: filename,
                severity: 'LOW',
                type: 'SKILL',
                message: `Skill declared but potentially unused: '${skill}'`,
                autoFixable: false
            });
        }
    }

    // 2.2 check for undeclared skills (slash commands)
    // Find all /something strings
    const slashCommands = bodyContent.matchAll(/\s\/([a-z0-9-]+)/g);
    const selfCommand = meta.command ? meta.command.replace('/', '') : filename.replace('.md', '');

    for (const match of slashCommands) {
        const cmd = match[1];

        // Ignore self-reference (e.g. /sync-project inside sync-project.md)
        if (cmd === selfCommand) continue;

        // If this command matches a known skill name, it should be declared
        if (knownSkills.has(cmd) && !declaredSkills.has(cmd)) {
            issues.push({
                file: filename,
                severity: 'MEDIUM',
                type: 'SKILL',
                message: `Skill used via command '/${cmd}' but not declared in frontmatter`,
                autoFixable: true
            });

            if (fixMode) {
                // Not implementing auto-fix for frontmatter yet as it's complex to preserve formatting
                // But we flag it as autoFixable for future
            }
        }
    }

    // 3. Logic Validation (Heuristic)
    let codeBlocks = (content.match(/```[\s\S]*?```/g) || []).join('\n');

    // 3.0 Enforce PNPM (Project Standard)
    if (/\bnpm (install|run|test|ci|start|build)\b/.test(codeBlocks)) {
        issues.push({
            file: filename,
            severity: 'MEDIUM',
            type: 'LOGIC',
            message: `Project uses pnpm, but 'npm' command found. Replace with 'pnpm'.`,
            autoFixable: true
        });
        if (fixMode) {
            // Smart replacements
            content = content
                .replace(/\bnpm ci\b/g, 'pnpm install --frozen-lockfile')
                .replace(/\bnpm (install|run|test|start|build)\b/g, 'pnpm $1');
        }
    }

    // 3.1 Check for build before install
    // Only warn if it looks like a CI/setup script (contains 'checkout' or 'setup')
    // OR if it's a completely isolated script.
    // We'll relax this check for now to avoid noise on manual debug workflows.
    if (/pnpm build/.test(codeBlocks)) {
        if (!/pnpm install|pnpm i\b/.test(codeBlocks) && /actions\/checkout/.test(content)) {
            issues.push({
                file: filename,
                severity: 'LOW',
                type: 'LOGIC',
                message: `CI workflow has build but no explicit install.`,
                autoFixable: false
            });
        }
    }

    // 3.2 Check for git commit before add
    // Rigid check: if 'git commit' exists, 'git add' should ideally exist or be handled.
    if (/git commit/.test(codeBlocks) && !/git add/.test(codeBlocks)) {
        issues.push({
            file: filename,
            severity: 'LOW',
            type: 'LOGIC',
            message: `Git commit found but no git add detected. Ensure stage is handled.`,
            autoFixable: false
        });
    }

    // 3.3 Check for secrets
    if (/sk_live_|ghp_|gho_|xoxb-|xoxp-/.test(content)) {
        issues.push({
            file: filename,
            severity: 'HIGH',
            type: 'SECURITY',
            message: `Potential hardcoded secret detected.`,
            autoFixable: false
        });
    }

    // 4. Turbo Opportunities
    // Look for bash code blocks without // turbo
    const lines = content.split('\n');
    let codeBlockOpen = false;
    let insideBash = false;
    let justSawTurbo = false;
    let contentChanged = false;

    // Check if content was already changed by pnpm fix
    if (originalContent !== content) {
        contentChanged = true;
    }

    // Simple state machine
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('```bash') || line.startsWith('```sh') || line.startsWith('```powershell')) {
            codeBlockOpen = true;
            insideBash = true;
            // Check previous line for // turbo
            const prevLine = lines[i - 1]?.trim() || '';
            const isTurbo = prevLine === '// turbo';

            // Heuristic for "safe to auto-run"
            // If the code block contains simple commands and no placeholders, it's a candidate
            // For now, we only flag if we detect "safe" keywords in the block content
            // We need to look ahead to find the content
            let blockContent = '';
            let j = i + 1;
            while (j < lines.length && !lines[j].startsWith('```')) {
                blockContent += lines[j] + '\n';
                j++;
            }

            const isSafe = blockContent.match(/^(ls|dir|echo|Get-Date|Write-Host|npx|npm|pnpm|git status)/m) && !blockContent.includes('rm ') && !blockContent.includes('sudo ');

            if (!isTurbo && isSafe) {
                issues.push({
                    file: filename,
                    line: i + 1,
                    severity: 'MEDIUM',
                    type: 'TURBO',
                    message: 'Code block could be auto-run (missing // turbo)',
                    autoFixable: true
                });

                if (fixMode) {
                    lines.splice(i, 0, '// turbo');
                    i++; // adjust index
                    contentChanged = true; // Mark as changed due to turbo fix
                }
            }
        } else if (line.startsWith('```')) {
            codeBlockOpen = false;
            insideBash = false;
        }
    }

    // Updated write condition:
    if (fixMode && (contentChanged || issues.some(i => i.autoFixable))) {
        fs.writeFileSync(filePath, lines.join('\n'));
    }

    return issues;
}

function generateGraph(files: string[]): string {
    const nodes: Record<string, { agent: string, command: string, triggers: string[] }> = {};
    const edges: string[] = [];
    const agents = new Set<string>();

    // 1. Parse all files to build nodes
    for (const file of files) {
        const content = fs.readFileSync(path.join(WORKFLOW_DIR, file), 'utf-8');
        const meta = parseFrontmatter(content);
        if (!meta) continue;

        const name = file.replace('.md', '');
        const agent = meta.primary_agent || 'unknown';
        const command = meta.command || `/${name}`;

        nodes[name] = { agent, command, triggers: [] };
        if (agent !== 'unknown') agents.add(agent);

        // Parse triggers from body
        const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---/, '');
        const slashCommands = body.matchAll(/\s(\/[a-z0-9-]+)/g);
        for (const match of slashCommands) {
            const targetCmd = match[1];
            // Find which workflow has this command
            // We need a second pass or look up in a map if we had one.
            // For now, store the trigger and resolve later
            nodes[name].triggers.push(targetCmd);
        }
    }

    // 2. Build edges
    // Reverse map command -> file
    const cmdToFile: Record<string, string> = {};
    for (const [file, data] of Object.entries(nodes)) {
        cmdToFile[data.command] = file;
    }

    for (const [file, data] of Object.entries(nodes)) {
        for (const triggerCmd of data.triggers) {
            const targetFile = cmdToFile[triggerCmd];
            if (targetFile && targetFile !== file) {
                edges.push(`  ${file} -->|calls| ${targetFile}`);
            }
        }
    }

    // 3. Generate Mermaid
    let mermaid = 'graph TD\n';

    // Subgraphs for agents
    for (const agent of agents) {
        const agentName = agent.replace('@', '');
        mermaid += `  subgraph ${agentName} [${agent}]\n`;
        for (const [file, data] of Object.entries(nodes)) {
            if (data.agent === agent) {
                mermaid += `    ${file}("${file}<br/>${data.command}")\n`;
            }
        }
        mermaid += '  end\n';
    }

    // Nodes without agent
    for (const [file, data] of Object.entries(nodes)) {
        if (data.agent === 'unknown') {
            mermaid += `  ${file}("${file}")\n`;
        }
    }

    // Edges
    edges.forEach(edge => mermaid += edge + '\n');

    return mermaid;
}

function main() {
    const args = process.argv.slice(2);
    const fixMode = args.includes('--fix');
    const graphMode = args.includes('--graph');

    if (!fs.existsSync(WORKFLOW_DIR)) {
        console.error(`Dir not found: ${WORKFLOW_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(WORKFLOW_DIR).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    const knownSkills = getKnownSkills();

    if (graphMode) {
        console.log('📊 Generating Knowledge Graph...');
        const mermaid = generateGraph(files);
        const graphPath = path.join(WORKFLOW_DIR, 'GRAPH.md');

        const graphContent = `# 🗺️ Agent Workflow Graph\n\nAuto-generated by \`workflow-analyzer.ts\`.\n\n\`\`\`mermaid\n${mermaid}\`\`\`\n`;

        fs.writeFileSync(graphPath, graphContent);
        console.log(`✅ Graph saved to ${graphPath}`);
        return;
    }

    let allIssues: Issue[] = [];

    console.log(`🔍 Analyzing ${files.length} agent workflows against ${knownSkills.size} skills...\n`);

    for (const file of files) {
        const issues = analyzeFile(path.join(WORKFLOW_DIR, file), fixMode, knownSkills);
        allIssues = [...allIssues, ...issues];
    }

    // Report
    const grouped = allIssues.reduce((acc, issue) => {
        acc[issue.file] = acc[issue.file] || [];
        acc[issue.file].push(issue);
        return acc;
    }, {} as Record<string, Issue[]>);

    for (const [file, issues] of Object.entries(grouped)) {
        console.log(`📄 ${file}`);
        for (const i of issues) {
            const icon = i.severity === 'HIGH' ? '🔴' : i.severity === 'MEDIUM' ? '🟡' : '🔵';
            console.log(`  ${icon} [${i.type}] ${i.message}`);
        }
        console.log('');
    }

    if (allIssues.length === 0) {
        console.log('✅ All workflows are optimized!');
    } else {
        console.log(`Found ${allIssues.length} issues.`);
        if (!fixMode) console.log('Run with --fix to apply auto-fixes.');
    }
}

main();
