import fs from 'fs';
import path from 'path';

export interface BacklogItem {
    id: string;
    source: 'ROADMAP' | 'DEBT';
    title: string;
    description?: string;
    priority?: string;
}

export class BacklogService {
    private static ROADMAP_PATH = path.join(process.cwd(), 'roadmap.md');
    private static DEBT_PATH = path.join(process.cwd(), 'DEBT.md');

    static async getItems(): Promise<BacklogItem[]> {
        const items: BacklogItem[] = [];

        // 1. Parse Roadmap
        if (fs.existsSync(this.ROADMAP_PATH)) {
            const roadmapContent = fs.readFileSync(this.ROADMAP_PATH, 'utf-8');
            const roadmapRegex = /- \[ \] \*\*(.+?)\*\*| - \[ \] (.+?)(?= <!--|$)/g;
            let match;
            while ((match = roadmapRegex.exec(roadmapContent)) !== null) {
                const title = match[1] || match[2];
                if (title) {
                    items.push({
                        id: `roadmap-${Buffer.from(title).toString('base64').substring(0, 8)}`,
                        source: 'ROADMAP',
                        title: title.trim(),
                    });
                }
            }
        }

        // 2. Parse DEBT
        if (fs.existsSync(this.DEBT_PATH)) {
            const debtContent = fs.readFileSync(this.DEBT_PATH, 'utf-8');
            const debtLines = debtContent.split('\n');
            for (const line of debtLines) {
                if (line.includes('Open') && line.includes('|')) {
                    const parts = line.split('|').map(p => p.trim());
                    if (parts.length >= 6) {
                        const file = parts[2];
                        const issue = parts[3];
                        items.push({
                            id: `debt-${Buffer.from(issue).toString('base64').substring(0, 8)}`,
                            source: 'DEBT',
                            title: `${file}: ${issue}`,
                        });
                    }
                }
            }
        }

        return items;
    }
}
