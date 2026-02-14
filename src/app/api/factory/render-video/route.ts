
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';

const renderRequestSchema = z.object({
  props: z.object({
    username: z.string().min(1),
    weekNumber: z.number().int().min(1),
  }).passthrough()
});

// This API route provides an endpoint to trigger Remotion video rendering.
export async function POST(request: Request) {
  try {
    // 1. Authentication
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const headerList = await headers();
    const secret = headerList.get('Authorization')?.replace('Bearer ', '') || headerList.get('x-cron-secret');
    const isValidSecret = secret && (secret === process.env.CRON_SECRET || secret === process.env.FACTORY_SECRET);

    if (!session && !isValidSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Data Validation
    const body = await request.json();
    const result = renderRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Invalid request payload',
        details: result.error.format()
      }, { status: 400 });
    }

    const { props } = result.data;

    const propsJson = JSON.stringify(props);
    const propsBase64 = Buffer.from(propsJson).toString('base64');

    const scriptPath = path.resolve(process.cwd(), 'scripts/render-video.mjs');
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
