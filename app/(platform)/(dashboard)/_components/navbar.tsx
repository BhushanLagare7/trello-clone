import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { PlusIcon } from "lucide-react";

import { FormPopover } from "@/components/form/form-popover";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

import { MobileSidebar } from "./mobile-sidebar";

/**
 * Navbar component that serves as the top navigation bar for the application.
 *
 * Includes:
 * - A mobile sidebar toggle for smaller screens
 * - A logo (visible on medium and larger screens)
 * - Board creation buttons (text button for desktop, icon button for mobile)
 * - Organization switcher and user profile button for account management
 */
export const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-14 w-full items-center border-b bg-white px-4 shadow-sm">
      {/* Sidebar toggle visible only on mobile */}
      <MobileSidebar />

      {/* Left section: Logo and board creation buttons */}
      <div className="flex items-center gap-x-4">
        {/* Logo is hidden on mobile screens */}
        <div className="hidden md:flex">
          <Logo />
        </div>

        {/* "Create" text button for desktop screens */}
        <FormPopover align="start" side="bottom" sideOffset={18}>
          <Button
            className="hidden h-auto rounded-sm px-2 py-1.5 md:block"
            size="sm"
            variant="primary"
          >
            Create
          </Button>
        </FormPopover>

        {/* "Create" icon button for mobile screens */}
        <FormPopover>
          <Button
            aria-label="Create board"
            className="block rounded-sm md:hidden"
            size="sm"
            variant="primary"
          >
            <PlusIcon className="size-4" />
          </Button>
        </FormPopover>
      </div>

      {/* Right section: Organization switcher and user profile button */}
      <div className="ml-auto flex items-center gap-x-2">
        {/* Allows users to switch between organizations or create a new one */}
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/organization/:id"
          afterLeaveOrganizationUrl="/select-org"
          afterSelectOrganizationUrl="/organization/:id"
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            },
          }}
          hidePersonal
        />

        {/* Displays the user's avatar and provides account management options */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: {
                height: 30,
                width: 30,
              },
            },
          }}
        />
      </div>
    </nav>
  );
};
