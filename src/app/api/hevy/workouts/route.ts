import { getErrorMessage } from '@/lib/error-message';
import { getHevyWorkouts } from '@/lib/hevy';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const hevyApiKey = request.headers.get('x-hevy-api-key');
  if (!hevyApiKey) {
    return NextResponse.json({ error: 'Hevy API Key is required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get('page') || '1');
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10');

  try {
    const data = await getHevyWorkouts(hevyApiKey, page, pageSize);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch Hevy workouts:', getErrorMessage(error));
    return NextResponse.json(
      {
        error: 'Could not analyze past battles.',
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const hevyApiKey = request.headers.get('x-hevy-api-key');
  if (!hevyApiKey) {
    return NextResponse.json({ error: 'Hevy API Key is required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await axios.post('https://api.hevyapp.com/v1/workouts', body, {
      headers: {
        'api-key': hevyApiKey,
        'Content-Type': 'application/json',
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    const response = axios.isAxiosError(error) ? error.response : undefined;
    console.error('Hevy Save Error:', response?.data || getErrorMessage(error));
    return NextResponse.json(
      {
        error: 'Failed to save to Archive.',
        details: response?.data,
      },
      { status: response?.status || 500 }
    );
  }
}
