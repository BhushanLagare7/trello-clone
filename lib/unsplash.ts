import { createApi } from "unsplash-js";

const unsplashApi = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

if (!unsplashApi) {
  throw new Error("NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is not set");
}

// Unsplash API client
export const unsplash = createApi({
  accessKey: unsplashApi,
  fetch: fetch,
});
