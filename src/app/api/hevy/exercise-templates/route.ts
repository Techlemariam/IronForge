import { getErrorMessage } from '@/lib/error-message';
import axios from 'axios';
import { NextResponse } from 'next/server';

type HevyErrorBody = {
  error?: string;
};

function getHevyApiKey(request: Request) {
  return request.headers.get('x-hevy-api-key');
}

export async function GET(request: Request) {
  const hevyApiKey = getHevyApiKey(request);
  if (!hevyApiKey) {
    return NextResponse.json({ error: 'Hevy API Key is required.' }, { status: 401 });
  }

  try {
    const url = 'https://api.hevyapp.com/v1/exercise_templates';
    const allExercises = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      try {
        const response = await axios.get(url, {
          headers: { 'api-key': hevyApiKey },
          params: { per_page: 100, page: page },
        });

        const exercises = response.data.exercise_templates;
        if (exercises && exercises.length > 0) {
          allExercises.push(...exercises);
          page++;
        } else {
          keepFetching = false;
        }
      } catch (error) {
        const body = axios.isAxiosError<HevyErrorBody>(error) ? error.response?.data : undefined;
        if (body?.error === 'Page not found') {
          keepFetching = false;
        } else {
          throw error;
        }
      }
    }
    return NextResponse.json({ exercise_templates: allExercises });
  } catch (error) {
    const response = axios.isAxiosError(error) ? error.response : undefined;
    console.error('Hevy Codex Assembly Error:', response?.data || getErrorMessage(error));
    return NextResponse.json(
      {
        error: 'Could not assemble the Exercise Codex.',
        details: response?.data,
      },
      { status: response?.status || 500 }
    );
  }
}
