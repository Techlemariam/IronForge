async function debugRoute() {
  const API_KEY = process.env.HEVY_API_KEY || '';
  const URL = 'http://localhost:3002/api/hevy/workouts?page=1&pageSize=1';

  console.log(`Debugging local route: ${URL}`);

  try {
    const response = await fetch(URL, {
      headers: { 'x-hevy-api-key': API_KEY },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Fetch Error:', e);
  }
}

debugRoute();
