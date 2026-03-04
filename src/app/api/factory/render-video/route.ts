
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// This API route provides an endpoint to trigger Remotion video rendering.
export async function POST(request: Request) {
  try {
    const { props } = await request.json();

    if (!props || typeof props !== 'object') {
      return NextResponse.json({ error: 'Valid props object is required' }, { status: 400 });
    }

    const propsJson = JSON.stringify(props);
    const propsBase64 = Buffer.from(propsJson).toString('base64');

    const scriptPath = [process.cwd(), 'scripts', 'render-video.mjs'].join('/');
    console.log(`[API] Executing render script at: ${scriptPath}`);

    // We use spawn to have better control over the process and its output.
    const child = spawn('node', [scriptPath, propsBase64], {
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
    });

    let stdout = '';
    let stderr = '';

    for await (const chunk of child.stdout) {
      stdout += chunk;
      console.log(`[Render Script STDOUT]: ${chunk}`);
    }
    for await (const chunk of child.stderr) {
      stderr += chunk;
      console.error(`[Render Script STDERR]: ${chunk}`);
    }

    const code = await new Promise(resolve => {
      child.on('close', resolve);
    });

    if (code !== 0) {
      console.error(`[API] Render script failed with code ${code}.`);
      return NextResponse.json({
        error: 'Video rendering failed.',
        details: stderr
      }, { status: 500 });
    }

    const outputPathMatch = stdout.match(/outputPath: (.*)/);
    if (!outputPathMatch) {
      return NextResponse.json({
        error: 'Could not determine output path from script.',
        details: stdout
      }, { status: 500 });
    }

    const outputPath = outputPathMatch[1].trim();

    return NextResponse.json({
      message: 'Video rendered successfully!',
      videoPath: outputPath
    }, { status: 200 });

  } catch (error) {
    console.error('[API] An unexpected error occurred:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
