import { createApi } from "unsplash-js";

const unsplashApi = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// Unsplash API client
export const unsplash = unsplashApi
  ? createApi({
      accessKey: unsplashApi,
      fetch: fetch,
    })
  : null;
