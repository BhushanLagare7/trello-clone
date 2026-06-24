import { ClerkProvider } from "@clerk/nextjs";

import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

/**
 * Root Layout for Platform Routes
 *
 * Wraps all platform-specific pages with ClerkProvider for authentication,
 * QueryProvider for data fetching, ModalProvider for global modals,
 * and Toaster for notifications.
 *
 * @param children - The page content to render
 * @returns The root layout with providers and children rendered inside
 */
const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <QueryProvider>
        {children}
        <ModalProvider />
        <Toaster />
      </QueryProvider>
    </ClerkProvider>
  );
};

export default PlatformLayout;
