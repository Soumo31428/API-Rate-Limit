const BASE_URL = 'http://127.0.0.1:8000';

export async function fetchEndpoint(endpointPath, apiKey) {
  const url = `${BASE_URL}${endpointPath}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (apiKey && apiKey.trim() !== '') {
    options.headers['X-API-Key'] = apiKey.trim();
  }

  try {
    const res = await fetch(url, options);
    let data;
    try {
      data = await res.json();
    } catch {
      data = { detail: 'Non-JSON response received' };
    }

    const limit = res.headers.get('X-RateLimit-Limit') || 'N/A';
    const remaining = res.headers.get('X-RateLimit-Remaining') || 'N/A';

    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      data,
      limit,
      remaining,
      endpoint: endpointPath,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      data: { detail: error.message || 'Failed to fetch (Check backend or CORS settings)' },
      limit: 'N/A',
      remaining: 'N/A',
      endpoint: endpointPath,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}
