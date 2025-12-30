import { NextResponse } from "next/server";
import axios from "axios";

function getHevyApiKey(request: Request) {
  return request.headers.get("x-hevy-api-key");
}

export async function GET(request: Request) {
  const hevyApiKey = getHevyApiKey(request);
  if (!hevyApiKey) {
    return NextResponse.json(
      { error: "Hevy API Key is required." },
      { status: 401 },
    );
  }

  try {
    const url = "https://api.hevyapp.com/v1/exercise_templates";
    let allExercises = [];
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
      try {
        const response = await axios.get(url, {
          headers: { "api-key": hevyApiKey },
          params: { per_page: 100, page: page },
        });

        const exercises = response.data.exercise_templates;
        if (exercises && exercises.length > 0) {
          allExercises.push(...exercises);
          page++;
        } else {
          keepFetching = false;
        }
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error === "Page not found"
        ) {
          keepFetching = false;
        } else {
          throw error;
        }
      }
    }
    return NextResponse.json({ exercise_templates: allExercises });
  } catch (error: any) {
    console.error(
      "Hevy Codex Assembly Error:",
      error.response?.data || error.message,
    );
    return NextResponse.json(
      {
        error: "Could not assemble the Exercise Codex.",
        details: error.response?.data,
      },
      { status: error.response?.status || 500 },
    );
  }
}
