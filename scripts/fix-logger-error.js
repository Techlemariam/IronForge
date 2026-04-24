import fs from 'fs';
import path from 'path';

const dirs = [path.join(process.cwd(), 'src/app/api'), path.join(process.cwd(), 'src/actions')];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  if (!content.includes('logger.error(')) {
    return;
  }

  // Replace logger.error( with logError(
  content = content.replace(/logger\.error\(/g, 'logError(');

  if (content !== originalContent) {
    // Add logError to import
    if (content.includes("import { logger } from '@/lib/logger';")) {
      content = content.replace(
        "import { logger } from '@/lib/logger';",
        "import { logger, logError } from '@/lib/logger';"
      );
    } else if (!content.includes('logError') && content.includes('@/lib/logger')) {
      // Just in case it's formatted differently
      content = content.replace(
        /import\s*\{\s*([^}]*?)\s*\}\s*from\s*['"]@\/lib\/logger['"]/g,
        (match, imports) => {
          if (imports.includes('logError')) return match;
          return `import { ${imports}, logError } from '@/lib/logger'`;
        }
      );
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

dirs.forEach(processDirectory);
console.log('Fix complete');
