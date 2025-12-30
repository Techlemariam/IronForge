import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const hevyApiKey = request.headers.get("x-hevy-api-key");
  if (!hevyApiKey) {
    return NextResponse.json(
      { error: "Hevy API Key is required." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    const response = await axios.get("https://api.hevyapp.com/v1/routines", {
      headers: { "api-key": hevyApiKey },
      params: params,
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Failed to fetch Hevy routines:",
      error.response?.data || error.message,
    );
    return NextResponse.json(
      {
        error: "Could not fetch Battle Plans.",
        details: error.response?.data,
      },
      { status: error.response?.status || 500 },
    );
  }
}
