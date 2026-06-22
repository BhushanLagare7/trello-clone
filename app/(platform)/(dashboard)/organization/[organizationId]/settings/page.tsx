import { OrganizationProfile } from "@clerk/nextjs";

/**
 * Settings page for managing organization details.
 * Renders the Clerk OrganizationProfile component with custom styling.
 */
const SettingsPage = () => {
  return (
    <div className="w-full">
      {/* Configuration for Clerk's Organization Profile component */}
      <OrganizationProfile
        appearance={{
          elements: {
            // --- Global Styles ---
            rootBox: {
              boxShadow: "none",
              width: "100%",
            },
            card: {
              border: "1px solid #e5e5e5",
              boxShadow: "none",
              width: "100%",
            },
          },
        }}
        // Use hash-based routing (e.g., /settings#members) instead of nested paths
        routing="hash"
      />
    </div>
  );
};

export default SettingsPage;
