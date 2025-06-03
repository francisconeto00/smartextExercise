const baseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function api(
  endpoint,
  { method = "GET", body, headers = {}, credentials = "include" } = {}
) {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, config);
    // 'middleware'
    if (response.status === 401 && endpoint !== "/auth/check") {
      window.location.href = "/";
      return;
    }
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error("Network response was not ok");
      }
      throw new Error(errorData.error || "Error in API call");
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API error on ${method} ${url}:`, error.message);
    throw error;
  }
}
