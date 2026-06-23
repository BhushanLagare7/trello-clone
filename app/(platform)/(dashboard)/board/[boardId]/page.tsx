import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

import ListContainer from "./_components/list-container";

/** Props for the BoardIdPage component */
interface BoardIdPageProps {
  params: Promise<{ boardId: string }>;
}

/**
 * Page component that displays all lists and cards for a specific board.
 * Redirects to organization selection if user has no active organization.
 *
 * @param params - Contains the boardId from the URL
 */
const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const { boardId } = await params;
  const { orgId } = await auth();

  // Ensure user belongs to an organization before accessing board
  if (!orgId) {
    return redirect("/select-org");
  }

  // Fetch all lists for the board, ensuring board belongs to the user's org
  const lists = await db.list.findMany({
    where: {
      boardId,
      board: {
        orgId, // Scopes query to the user's organization for security
      },
    },
    include: {
      cards: {
        orderBy: {
          order: "asc", // Maintain user-defined card ordering
        },
      },
    },
  });

  return (
    // Enable horizontal scrolling for boards with many lists
    <div className="h-full overflow-x-auto p-4">
      <ListContainer boardId={boardId} data={lists} />
    </div>
  );
};

export default BoardIdPage;
