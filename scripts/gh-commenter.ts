/**
 * Bi-directional Chat Facilitator for CI Doctor God Mode.
 * Allows the agent to post status updates or confirmations back to GitHub PRs.
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function getPrNumber(): string {
    try {
        return execSync('gh pr view --json number -q ".number"').toString().trim();
    } catch (e) {
        return '';
    }
}

function postPrComment(prNumber: string, message: string) {
    try {
        execSync(`gh pr comment ${prNumber} --body "${message}"`);
        console.log(`✅ Posted comment to PR #${prNumber}`);
    } catch (e) {
        console.error('Failed to post PR comment:', e);
    }
}

function main() {
    const args = process.argv.slice(2);
    const message = args.join(' ');

    if (!message) {
        console.log('Usage: npx tsx scripts/gh-commenter.ts "Your message here"');
        return;
    }

    const prNumber = getPrNumber();
    if (!prNumber) {
        console.error('Could not determine PR number');
        return;
    }

    postPrComment(prNumber, message);
}

main();
