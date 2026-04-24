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

  if (
    !content.includes('console.log') &&
    !content.includes('console.error') &&
    !content.includes('console.warn') &&
    !content.includes('console.info')
  ) {
    return;
  }

  content = content.replace(/console\.log\(/g, 'logger.info(');
  content = content.replace(/console\.info\(/g, 'logger.info(');
  content = content.replace(/console\.warn\(/g, 'logger.warn(');

  // Note: console.error(err) is trickier if it's multiple args, but we can just use logger.error for now,
  // and we'll fix up specifically if it breaks. Actually, pino's logger.error works nicely with error objects too.
  content = content.replace(/console\.error\(/g, 'logger.error(');

  if (content !== originalContent) {
    // Add import if not exists
    if (!content.includes('@/lib/logger')) {
      // Find the last import statement
      const importRegex = /^import\s+.*?(?:'|")\s*;/gm;
      let lastImportIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }

      const importStatement = "\nimport { logger } from '@/lib/logger';";
      if (lastImportIndex > 0) {
        content =
          content.slice(0, lastImportIndex) + importStatement + content.slice(lastImportIndex);
      } else {
        content = importStatement + '\n' + content;
      }
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

dirs.forEach(processDirectory);
console.log('Migration complete');
