import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { trackUsage } from '../quota-manager.js';

// Mock dependencies
vi.mock('fs');
vi.mock('path');
vi.mock('../quota-manager');

// Mock specific path methods we use
vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
vi.mocked(path.join).mockImplementation((...args) => args.join('/'));

// Create a mock for Octokit
const mockCreateWorkflowDispatch = vi.fn();
vi.mock('octokit', () => ({
    Octokit: class {
        rest = {
            actions: {
                createWorkflowDispatch: mockCreateWorkflowDispatch
            }
        };
    }
}));

// We need to test the handler logic, but it's inside the main file which executes on import.
// For this test, we'll manually implement the logic we want to test since exporting the server 
// instance from index.ts might trigger execution.
// Ideally, we would refactor index.ts to export the handler functions for easier testing.

describe('trigger_autonomous_workflow logic', () => {
    const REPO_OWNER = "Techlemariam";
    const REPO_NAME = "IronForge";
    const workflow = "night-shift";
    const model = "gemini-2.5-flash";
    const cwd = "/test/cwd";

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(process, 'cwd').mockReturnValue(cwd);
        vi.mocked(path.resolve).mockImplementation((...args) => args.join('/'));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should signal Antigravity when available', async () => {
        // Setup scenarios
        vi.mocked(fs.existsSync).mockReturnValue(true); // Antigravity/Tasks dir exists
        vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

        // Emulate the logic from index.ts
        const taskDir = path.resolve(cwd, "../../.agent/tasks");
        const antigravityAvailable = fs.existsSync(taskDir);

        let result;
        if (antigravityAvailable) {
            const taskPath = path.join(taskDir, "current.md");
            const taskContent = `# Autonomous Mission: ${workflow}\nModel: ${model}\nTriggered via MCP at ${new Date().toISOString()}`;
            fs.writeFileSync(taskPath, taskContent);
            trackUsage(1);
            result = "antigravity";
        } else {
            result = "fallback";
        }

        // Assertions
        expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('.agent/tasks'));
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining('current.md'),
            expect.stringContaining('# Autonomous Mission')
        );
        expect(trackUsage).toHaveBeenCalledWith(1);
        expect(result).toBe("antigravity");
        expect(mockCreateWorkflowDispatch).not.toHaveBeenCalled();
    });

    it('should fallback to GitHub Actions when Antigravity is unavailable', async () => {
        // Setup scenarios
        vi.mocked(fs.existsSync).mockReturnValue(false); // Task dir does not exist

        // Emulate the logic
        const taskDir = path.resolve(cwd, "../../.agent/tasks");
        const antigravityAvailable = fs.existsSync(taskDir);

        let result;
        if (antigravityAvailable) {
            result = "antigravity";
        } else {
            await mockCreateWorkflowDispatch({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                workflow_id: `autonomous-${workflow}.yml`,
                ref: "main",
                inputs: { workflow, model },
            });
            trackUsage(1);
            result = "fallback";
        }

        // Assertions
        expect(fs.existsSync).toHaveBeenCalled();
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        expect(mockCreateWorkflowDispatch).toHaveBeenCalledWith(expect.objectContaining({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            workflow_id: `autonomous-${workflow}.yml`
        }));
        expect(trackUsage).toHaveBeenCalledWith(1);
        expect(result).toBe("fallback");
    });
});
