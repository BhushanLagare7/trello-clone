import { notFound, redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

import { BoardNavbar } from "./_components/board-navbar";

/** Props for the BoardIdLayout component */
interface BoardIdLayoutProps {
  children: React.ReactNode;
  /** Route params containing the board's unique identifier */
  params: Promise<{ boardId: string }>;
}

/**
 * Generates metadata for the board page.
 * Returns the board's title if found, otherwise falls back to "Board".
 *
 * @param params - Contains the boardId from the route
 * @returns Object containing the page title
 */
export async function generateMetadata({
  params,
}: BoardIdLayoutProps): Promise<{ title: string }> {
  const { boardId } = await params;
  const { orgId } = await auth();

  // Return default title if user is not part of an organization
  if (!orgId) {
    return { title: "Board" };
  }

  // Fetch the board ensuring it belongs to the current organization
  const board = await db.board.findUnique({
    where: {
      id: boardId,
      orgId,
    },
  });

  // Return default title if board does not exist
  if (!board) {
    return { title: "Board" };
  }

  return { title: board?.title ?? "Board" };
}

/**
 * Layout component for individual board pages.
 * Handles authentication, authorization, and renders the board's
 * full-screen background image with a navbar and page content.
 *
 * @param children - Nested page content to render within the layout
 * @param params   - Contains the boardId from the route
 *
 * @redirects `/select-org` if the user has no active organization
 * @throws {notFound} If the board does not exist or does not belong to the organization
 */
const BoardIdLayout = async ({ children, params }: BoardIdLayoutProps) => {
  const { boardId } = await params;
  const { orgId } = await auth();

  // Redirect unauthenticated or org-less users to org selection
  if (!orgId) {
    return redirect("/select-org");
  }

  // Fetch board, scoped to the current organization for security
  const board = await db.board.findUnique({
    where: {
      id: boardId,
      orgId,
    },
  });

  // Trigger 404 if the board doesn't exist or is inaccessible
  if (!board) {
    notFound();
  }

  return (
    /*
     * Full-screen container using the board's image as a background.
     * A dark overlay improves readability of content on top of the image.
     */
    <div
      className="relative h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${board.imageFullUrl})`,
      }}
    >
      {/* Top navigation bar displaying board details and actions */}
      <BoardNavbar data={board} />

      {/* Semi-transparent dark overlay for better content contrast */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Main content area, offset to clear the navbar */}
      <main className="relative h-full pt-28">{children}</main>
    </div>
  );
};

export default BoardIdLayout;
