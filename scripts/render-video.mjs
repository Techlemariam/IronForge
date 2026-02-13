
import { spawn } from 'child_process';
import path from 'path';

// This script is designed to be called by the agent to render a Remotion video.
// It takes a Base64 encoded JSON string as an argument, which contains the props for the video.

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });
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
  const compositionId = 'ProgressVideo';
  const outputDir = 'public/videos';
  
  // Ensure the output directory exists
  // Note: This part is simple, for a real app, consider more robust directory creation
  const fs = await import('fs');
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = `progress_${props.username.replace(/[^a-z0-9]/gi, '_')}_week${props.weekNumber}.mp4`;
  const outputPath = path.join(outputDir, outputFilename);

  console.log(`Rendering video for ${props.username}...`);
  console.log(`Output will be saved to: ${outputPath}`);

  try {
    await runCommand('pnpm', [
      'remotion',
      'render',
      compositionId,
      outputPath,
      `--props=${propsJson}`,
      '--log-level=verbose'
    ]);

    console.log(`✅ Video rendered successfully!`);
    // This specific line is what the agent's workflow (`factory.md`) expects to parse.
    console.log(`outputPath: ${outputPath}`);

  } catch (err) {
      console.error('Video rendering failed during execution:', err);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('An unexpected error occurred:', err);
  process.exit(1);
});
