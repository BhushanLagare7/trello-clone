import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names using clsx and tailwind-merge.
 * @param inputs - The class names to merge.
 * @returns The merged class names as a string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an organization slug into a human-readable title.
 *
 * It handles two cases:
 * 1. Clerk's formatted slugs with unique IDs (e.g., "meta-inc--1781935645417971781")
 *    - Strips the unique ID suffix to get "meta-inc"
 *    - Converts to "Meta Inc"
 * 2. Standard slugs (e.g., "my-org")
 *    - Converts to "My Org"
 */
export function formatOrgSlug(slug: string): string {
  if (!slug) return "";

  // Splits by double hyphen '--' to remove Clerk's auto-generated unique suffix
  const baseSlug = slug.split("--")[0];

  const words = baseSlug
    .replace(/[-_]+/g, " ") // converts hyphens and underscores to spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // converts camelCase to space separated
    .trim()
    .split(/\s+/); // splits by spaces

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
