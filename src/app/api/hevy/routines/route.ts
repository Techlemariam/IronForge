import { getErrorMessage } from '@/lib/error-message';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const hevyApiKey = request.headers.get('x-hevy-api-key');
  if (!hevyApiKey) {
    return NextResponse.json({ error: 'Hevy API Key is required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    const response = await axios.get('https://api.hevyapp.com/v1/routines', {
      headers: { 'api-key': hevyApiKey },
      params: params,
    });
    return NextResponse.json(response.data);
  } catch (error) {
    const response = axios.isAxiosError(error) ? error.response : undefined;
    console.error('Failed to fetch Hevy routines:', response?.data || getErrorMessage(error));
    return NextResponse.json(
      {
        error: 'Could not fetch Battle Plans.',
        details: response?.data,
      },
      { status: response?.status || 500 }
    );
  }
}
