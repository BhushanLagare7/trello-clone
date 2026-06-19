import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

// Protect all routes except public ones
export default clerkMiddleware(async (auth, req) => {
  // Skip authentication for public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Match all routes except public ones
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
