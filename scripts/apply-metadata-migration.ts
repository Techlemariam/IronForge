import * as fs from 'fs';
import * as path from 'path';

const WORKFLOWS_DIR = path.join(process.cwd(), '.agent/workflows');

interface WorkflowMetadata {
    description: string;
    command: string;
    category: string;
    trigger: string;
    version: string;
    telemetry: string;
    primary_agent: string;
    domain: string;
}

const MAPPINGS: Record<string, Partial<WorkflowMetadata>> = {
    // Personas
    'architect': { category: 'persona', domain: 'core', primary_agent: '@architect' },
    'coder': { category: 'persona', domain: 'core', primary_agent: '@coder' },
    'qa': { category: 'persona', domain: 'qa', primary_agent: '@qa' },
    'analyst': { category: 'persona', domain: 'business', primary_agent: '@analyst' },
    'ui-ux': { category: 'persona', domain: 'ui', primary_agent: '@ui-ux' },
    'game-designer': { category: 'persona', domain: 'game', primary_agent: '@game-designer' },
    'titan-coach': { category: 'persona', domain: 'bio', primary_agent: '@titan-coach' },
    'manager': { category: 'persona', domain: 'meta', primary_agent: '@manager' },
    'strategist': { category: 'persona', domain: 'business', primary_agent: '@strategist' },
    'writer': { category: 'persona', domain: 'game', primary_agent: '@writer' },
    'librarian': { category: 'specialist', domain: 'meta', primary_agent: '@librarian' },
    'infrastructure': { category: 'persona', domain: 'infra', primary_agent: '@infrastructure' },
    'security': { category: 'persona', domain: 'auth', primary_agent: '@security' },
    'platform': { category: 'persona', domain: 'ui', primary_agent: '@platform' },

    // Actions/Execution
    'cleanup': { category: 'execution', domain: 'core', primary_agent: '@cleanup' },
    'debt-attack': { category: 'execution', domain: 'core', primary_agent: '@cleanup' },
    'schema': { category: 'execution', domain: 'database', primary_agent: '@infrastructure' },
    'deploy': { category: 'deployment', domain: 'infra', primary_agent: '@infrastructure' },
    'unit-tests': { category: 'execution', domain: 'qa', primary_agent: '@coder' },
    'debug': { category: 'utility', domain: 'core', primary_agent: '@debug' },
    'polish': { category: 'utility', domain: 'core', primary_agent: '@polish' },
    'perf': { category: 'utility', domain: 'core', primary_agent: '@perf' },
    'triage': { category: 'utility', domain: 'meta', primary_agent: '@manager' },
    'claim-task': { category: 'utility', domain: 'meta', primary_agent: '@manager' },
    'switch-branch': { category: 'utility', domain: 'meta', primary_agent: '@manager' },

    // Monitoring
    'monitor-ci': { category: 'monitoring', domain: 'infra', primary_agent: '@infrastructure' },
    'monitor-db': { category: 'monitoring', domain: 'database', primary_agent: '@infrastructure' },
    'monitor-debt': { category: 'monitoring', domain: 'core', primary_agent: '@manager' },
    'monitor-deploy': { category: 'monitoring', domain: 'infra', primary_agent: '@infrastructure' },
    'monitor-game': { category: 'monitoring', domain: 'game', primary_agent: '@game-designer' },
    'monitor-growth': { category: 'monitoring', domain: 'business', primary_agent: '@strategist' },
    'monitor-logic': { category: 'monitoring', domain: 'core', primary_agent: '@architect' },
    'monitor-strategy': { category: 'monitoring', domain: 'business', primary_agent: '@strategist' },
    'monitor-tests': { category: 'monitoring', domain: 'qa', primary_agent: '@qa' },
    'monitor-bio': { category: 'monitoring', domain: 'bio', primary_agent: '@titan-coach' },
    'health-check': { category: 'monitoring', domain: 'meta', primary_agent: '@manager' },

    // Verification
    'gatekeeper': { category: 'verification', domain: 'core', primary_agent: '@qa' },
    'pre-deploy': { category: 'verification', domain: 'infra', primary_agent: '@qa' },
    'stresstests': { category: 'verification', domain: 'core', primary_agent: '@qa' },

    // Planning/Meta
    'startup': { category: 'meta', domain: 'meta', primary_agent: '@manager' },
    'feature': { category: 'planning', domain: 'meta', primary_agent: '@manager' },
    'idea': { category: 'planning', domain: 'meta', primary_agent: '@analyst' },
    'sprint-plan': { category: 'planning', domain: 'meta', primary_agent: '@manager' },
    'sprint-auto': { category: 'meta', domain: 'meta', primary_agent: '@manager' },
    'evolve': { category: 'meta', domain: 'meta', primary_agent: '@manager' },
    'night-shift': { category: 'meta', domain: 'meta', primary_agent: '@manager' },
    'domain-session': { category: 'meta', domain: 'meta', primary_agent: '@manager' },
    'INDEX': { category: 'meta', domain: 'meta', primary_agent: '@manager' }, // Special case
};

function getMetadata(filename: string, existingDesc: string): WorkflowMetadata {
    const name = path.basename(filename, '.md');
    const defaults = MAPPINGS[name] || { category: 'utility', domain: 'core', primary_agent: '@manager' };

    return {
        description: existingDesc || `Workflow for ${name}`,
        command: `/${name}`,
        trigger: 'manual',
        version: '1.0.0',
        telemetry: 'enabled',
        category: defaults.category || 'utility',
        primary_agent: defaults.primary_agent || '@manager',
        domain: defaults.domain || 'core',
    };
}

function processFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let lines = content.split('\n');

    // 1. Extract existing description if present in old frontmatter
    let description = '';
    let fmStart = -1;
    let fmEnd = -1;

    if (lines[0]?.trim() === '---') {
        fmStart = 0;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                fmEnd = i;
                break;
            }
            const match = lines[i].match(/^description:\s*(.*)$/);
            if (match) {
                description = match[1].replace(/^"|"$/g, '').trim(); // Unquote
            }
        }
    }

    // 2. Clear old frontmatter and code blocks wrapping it
    let bodyLines = [];
    if (fmEnd > 0) {
        bodyLines = lines.slice(fmEnd + 1);
    } else {
        // Check for ``` wrapper around frontmatter (common corruption)
        if (lines[0]?.trim().startsWith('```')) {
            bodyLines = lines.slice(1); // naive
            // Re-check for internal ---
            // Actually, better to just strip ALL frontmatter-like stuff from top
        } else {
            bodyLines = lines;
        }
    }

    // Clean empty leading lines
    while (bodyLines.length > 0 && bodyLines[0].trim() === '') {
        bodyLines.shift();
    }

    // 3. Fix Heading Hierarchy (MD041 / MD025)
    // Ensure first meaningful line is H1
    let hasH1 = false;
    for (let i = 0; i < bodyLines.length; i++) {
        const line = bodyLines[i].trim();
        if (line === '') continue;

        if (line.startsWith('# ')) {
            hasH1 = true;
            break; // Good
        } else if (line.startsWith('## ')) {
            bodyLines[i] = line.substring(1); // Promote to H1
            hasH1 = true;
            break;
        } else {
            // Content before heading? Insert H1
            const name = path.basename(filePath, '.md');
            bodyLines.splice(i, 0, `# Workflow: /${name}`, '');
            hasH1 = true;
            break;
        }
    }

    // Demote subsequent H1s to H2 to fix MD025 (single H1)
    let h1Count = 0;
    for (let i = 0; i < bodyLines.length; i++) {
        if (bodyLines[i].startsWith('# ')) {
            h1Count++;
            if (h1Count > 1) {
                bodyLines[i] = '#' + bodyLines[i]; // Demote to ##
            }
        }
    }

    // 4. Generate New Frontmatter
    const metadata = getMetadata(path.basename(filePath), description);
    const newFM = [
        '---',
        `description: "${metadata.description}"`,
        `command: "${metadata.command}"`,
        `category: "${metadata.category}"`,
        `trigger: "${metadata.trigger}"`,
        `version: "${metadata.version}"`,
        `telemetry: "${metadata.telemetry}"`,
        `primary_agent: "${metadata.primary_agent}"`,
        `domain: "${metadata.domain}"`,
        '---',
        ''
    ];

    // 5. Append Version History if missing
    const bodyText = bodyLines.join('\n');
    let finalBody = bodyLines;
    if (!bodyText.includes('## Version History')) {
        finalBody.push('', '## Version History', '', '### 1.0.0 (2026-01-08)', '', '- Initial stable release with standardized metadata');
    }

    const finalContent = newFM.join('\n') + finalBody.join('\n');
    fs.writeFileSync(filePath, finalContent);
    console.log(`Processed ${path.basename(filePath)}`);
}

// Main
if (fs.existsSync(WORKFLOWS_DIR)) {
    const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.md') && f !== 'MANUAL.md' && f !== 'METADATA.md' && f !== 'GRAPH.md' && f !== 'INDEX.md');
    // Process INDEX.md separately? Or skip? The script excludes it above but mapping has it. 
    // Let's include INDEX.md but handle it carefully. Actually, INDEX.md usually has description only.
    // I'll add INDEX.md back to the list manually if needed, but for now lets stick to the workflows.
    // The user requested 50 workflows. 

    files.push('INDEX.md'); // Add it back

    files.forEach(file => {
        processFile(path.join(WORKFLOWS_DIR, file));
    });
    console.log('Migration complete.');
} else {
    console.error('Workflows directory not found');
}
