"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";
import { useIsClient } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";

import { Sidebar } from "./sidebar";

/**
 * MobileSidebar component provides a sheet-based navigation menu
 * for smaller screens, controlled by a global state hook.
 */
export const MobileSidebar = () => {
  const pathname = usePathname();
  // Ensures component only renders on client to prevent hydration mismatch
  const isClient = useIsClient();

  const onOpen = useMobileSidebar((state) => state.onOpen);
  const onClose = useMobileSidebar((state) => state.onClose);
  const isOpen = useMobileSidebar((state) => state.isOpen);

  // Automatically close the sidebar whenever the URL route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Trigger button visible only on mobile (below 'md' breakpoint) */}
      <Button
        className="mr-2 block md:hidden"
        size="sm"
        variant="ghost"
        onClick={onOpen}
      >
        <Menu className="size-4" />
      </Button>

      {/* Mobile drawer overlay */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="p-2 pt-10" side="left">
          <Sidebar storageKey="t-sidebar-mobile-state" />
        </SheetContent>
      </Sheet>
    </>
  );
};
