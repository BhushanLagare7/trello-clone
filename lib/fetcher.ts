/**
 * Utility function to fetch data from a given URL and return it as JSON.
 * Throws an error for non-OK responses so callers receive an exception rather
 * than silently treating an error payload as valid data.
 */
export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  });
