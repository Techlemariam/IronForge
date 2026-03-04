/**
 * IronForge Universal Trigger (Google Apps Script Version)
 * 
 * Trigger this from Google Sheets, Google Forms, or a scheduled trigger.
 */

const GITHUB_OWNER = 'Techlemariam';
const GITHUB_REPO = 'IronForge';
const GITHUB_PAT = 'your_github_pat_here'; // Store in Script Properties!
const TRIGGER_SECRET = 'your_remote_trigger_secret'; // Must match GITHUB_SECRET

/**
 * Trigger a workflow
 * @param {string} workflow - e.g. "night-shift", "polish"
 * @param {string} mode - "antigravity-signal" or "direct-execution"
 */
function triggerIronForge(workflow = 'health-check', mode = 'antigravity-signal') {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`;

    const payload = {
        event_type: 'google-api-trigger',
        client_payload: {
            workflow: workflow,
            mode: mode,
            token: TRIGGER_SECRET,
            model: 'gemini-2.5-flash',
            branch: 'main'
        }
    };

    const options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            'Authorization': `token ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    Logger.log(`Status: ${response.getResponseCode()}`);
    Logger.log(`Response: ${response.getContentText()}`);
}

// Example: Trigger nightly maintenance from Mobile (via Apps Script Web App)
function doGet(e) {
    const workflow = e.parameter.workflow || 'health-check';
    triggerIronForge(workflow);
    return ContentService.createTextOutput(`Triggered IronForge: ${workflow}`);
}
