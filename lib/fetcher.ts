/**
 * Utility function to fetch data from a given URL and return it as JSON
 */
export const fetcher = (url: string) => fetch(url).then((res) => res.json());
