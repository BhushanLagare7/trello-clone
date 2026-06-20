import { auth } from "@clerk/nextjs/server";

import { OrgControl } from "./_components/org-control";

export async function generateMetadata(): Promise<{ title: string }> {
  // Get the organization slug from the auth context.
  const { orgSlug } = await auth();

  /**
   * The title of the page is the organization slug, or "Organization" if not available.
   */
  return {
    title: orgSlug ?? "Organization",
  };
}

const OrganizationIdLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <OrgControl />
      {children}
    </>
  );
};

export default OrganizationIdLayout;
