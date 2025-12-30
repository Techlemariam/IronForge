
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const OUTPUT_FILE = path.join(process.cwd(), '.agent', 'memory', 'knowledge-graph.json');

interface Node {
    id: string; // file path relative to root
    type: 'module' | 'service' | 'component' | 'type' | 'workflow';
    path: string;
}

interface Edge {
    from: string;
    to: string;
    relation: 'imports' | 'calls';
}

interface KnowledgeGraph {
    nodes: Node[];
    edges: Edge[];
    metadata: {
        lastUpdated: string;
        nodeCount: number;
        edgeCount: number;
    };
}

function scanDirectory(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            scanDirectory(filePath, fileList);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function determineType(filePath: string): Node['type'] {
    if (filePath.includes('services')) return 'service';
    if (filePath.includes('components')) return 'component';
    if (filePath.includes('types')) return 'type';
    if (filePath.includes('actions')) return 'service';
    if (filePath.includes('.agent/workflows')) return 'workflow';
    return 'module';
}

function analyzeFile(filePath: string, nodes: Node[], edges: Edge[]) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

    // Add Node
    if (!nodes.find(n => n.id === relativePath)) {
        nodes.push({
            id: relativePath,
            type: determineType(relativePath),
            path: relativePath
        });
    }

    // Analyze Imports (Simple Regex)
    const importRegex = /import\s+(?:[\w\s{},*]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];

        // Resolve import path
        let resolvedPath = '';
        if (importPath.startsWith('.')) {
            resolvedPath = path.join(path.dirname(filePath), importPath);
        } else if (importPath.startsWith('@/')) {
            resolvedPath = path.join(process.cwd(), 'src', importPath.substring(2));
        } else {
            // External library or alias not handled
            continue;
        }

        // Attempt to add extension if missing
        if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx')) {
            if (fs.existsSync(resolvedPath + '.ts')) resolvedPath += '.ts';
            else if (fs.existsSync(resolvedPath + '.tsx')) resolvedPath += '.tsx';
            else if (fs.existsSync(resolvedPath + '/index.ts')) resolvedPath += '/index.ts';
            else if (fs.existsSync(resolvedPath + '/index.tsx')) resolvedPath += '/index.tsx';
            else continue; // Could not resolve
        }

        const targetRelativePath = path.relative(process.cwd(), resolvedPath).replace(/\\/g, '/');
        edges.push({
            from: relativePath,
            to: targetRelativePath,
            relation: 'imports'
        });
    }
}

async function main() {
    console.log('🔍 Scanning codebase...');
    const files = scanDirectory(SRC_DIR);
    console.log(`Found ${files.length} TypeScript files.`);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    files.forEach(file => analyzeFile(file, nodes, edges));

    const graph: KnowledgeGraph = {
        nodes,
        edges,
        metadata: {
            lastUpdated: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
        }
    };

    // Create dir if not exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graph, null, 2));
    console.log(`✅ Knowledge graph generated at ${OUTPUT_FILE}`);
    console.log(`Nodes: ${nodes.length}, Edges: ${edges.length}`);
}

main().catch(console.error);
