import fs from 'fs';

/**
 * CI Forensic Annotator
 * Converts specialist doctor logs and JSON reports into GHA Annotations.
 */

async function annotate() {
    const reportPath = process.argv[2];
    if (!reportPath || !fs.existsSync(reportPath)) {
        console.log('::warning ::No forensic report found for annotation.');
        return;
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    // Format: { issues: [ { file: string, line: number, message: string, severity: 'error' | 'warning' } ] }
    if (report.issues && Array.isArray(report.issues)) {
        for (const issue of report.issues) {
            const level = issue.severity === 'warning' ? 'warning' : 'error';
            console.log(`::${level} file=${issue.file},line=${issue.line},title=Forensic Finding::${issue.message}`);
        }
    }

    console.log('✅ Forensic annotations complete.');
}

annotate().catch(err => {
    console.error('::error ::Failed to generate annotations: ' + err.message);
    process.exit(1);
});
