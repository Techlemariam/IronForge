
import { spawn } from 'child_process';
import path from 'path';
import { tmpdir } from 'os';

// This script is designed to be called by the agent to render a Remotion video.
// It takes a Base64 encoded JSON string as an argument, which contains the props for the video.

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    // shell: false is safer as it prevents shell injection
    const proc = spawn(command, args, { stdio: 'inherit', shell: false });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const propsBase64 = process.argv[2];
  if (!propsBase64) {
    console.error('Error: No props provided. Pass props as a base64 encoded JSON string.');
    process.exit(1);
  }

  let propsJson;
  try {
    propsJson = Buffer.from(propsBase64, 'base64').toString('utf-8');
  } catch (e) {
    console.error("Error: Invalid Base64 props string.", e);
    process.exit(1);
  }

  const props = JSON.parse(propsJson);

  // Basic validation and defaults
  if (typeof props !== 'object' || props === null) {
    console.error('Error: Invalid props format.');
    process.exit(1);
  }

  const safeUsername = (props.username || 'Titan').toString().replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  const safeWeek = parseInt(props.weekNumber) || 0;

  const compositionId = 'ProgressVideo';
  const outputDir = 'public/videos';

  // Ensure the output directory exists
  const fs = await import('fs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = `progress_${safeUsername}_week${safeWeek}.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  console.log(`Rendering video for ${props.username}...`);
  console.log(`Output will be saved to: ${outputPath}`);

  const tempPropsPath = path.join(tmpdir(), `remotion-props-${Date.now()}.json`);

  try {
    await fs.promises.writeFile(tempPropsPath, propsJson);

    await runCommand('pnpm', [
      'remotion',
      'render',
      compositionId,
      outputPath,
      `--props=${tempPropsPath}`,
      '--log-level=verbose'
    ]);

    console.log(`✅ Video rendered successfully!`);
    console.log(`outputPath: ${outputPath}`);

  } catch (err) {
    console.error('Video rendering failed during execution:', err);
    process.exit(1);
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPropsPath)) {
      try {
        fs.unlinkSync(tempPropsPath);
      } catch (e) {
        console.warn('Failed to clean up temp props file:', e);
      }
    }
  }
}

main().catch((err) => {
  console.error('An unexpected error occurred:', err);
  process.exit(1);
});
