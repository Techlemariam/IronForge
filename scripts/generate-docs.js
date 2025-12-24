
const fs = require('fs');
const path = require('path');

const hevyPath = path.join(process.cwd(), 'docs', 'hevy_api.json');
const intervalsPath = path.join(process.cwd(), 'docs', 'intervals_api.json');
const outputPath = path.join(process.cwd(), 'docs', 'api-reference.md');

function generateMarkdown() {
  let md = '# 📚 API Reference\n\nGenerated automatically from OpenAPI schemas.\n\n';

  // Hevy
  if (fs.existsSync(hevyPath)) {
    const hevy = JSON.parse(fs.readFileSync(hevyPath, 'utf8'));
    const doc = hevy.swaggerDoc || hevy;
    md += `## 🏋️ Hevy API (${doc.info.version})\n\n`;
    md += `${doc.info.description.trim()}\n\n`;
    md += processPaths(doc.paths);
  } else {
    md += '## 🏋️ Hevy API\n\n*Schema not found.*\n\n';
  }

  // Intervals
  if (fs.existsSync(intervalsPath)) {
    const intervals = JSON.parse(fs.readFileSync(intervalsPath, 'utf8'));
    md += `## 🚴 Intervals.icu API (${intervals.info.version})\n\n`;
    md += `Base URL: ${intervals.servers?.[0]?.url || 'N/A'}\n\n`;
    md += processPaths(intervals.paths);
  } else {
    md += '## 🚴 Intervals.icu API\n\n*Schema not found.*\n\n';
  }

  fs.writeFileSync(outputPath, md);
  console.log(`Generated ${outputPath}`);
}

function processPaths(paths) {
  let content = '';
  if (!paths) return content;

  for (const [route, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      content += `### ${method.toUpperCase()} \`${route}\`\n\n`;
      if (details.summary) content += `**Summary:** ${details.summary}\n\n`;
      if (details.description) content += `> ${details.description}\n\n`;
      
      if (details.parameters && details.parameters.length > 0) {
        content += '**Parameters:**\n\n';
        content += '| Name | In | Type | Required | Description |\n';
        content += '|------|----|------|----------|-------------|\n';
        details.parameters.forEach(param => {
          const type = param.schema ? param.schema.type : 'any';
          const required = param.required ? '✅' : '';
          const desc = param.description ? param.description.replace(/\n/g, ' ') : '';
          content += `| \`${param.name}\` | ${param.in} | ${type} | ${required} | ${desc} |\n`;
        });
        content += '\n';
      }
      content += '---\n\n';
    }
  }
  return content;
}

generateMarkdown();
