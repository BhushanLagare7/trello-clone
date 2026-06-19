import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

/**
 * Main navigation bar component.
 * Features a sticky layout with branding and authentication actions.
 */
export const Navbar = () => {
  return (
    <div className="fixed top-0 flex h-14 w-full items-center border-b bg-white px-4 shadow-sm">
      <div className="mx-auto flex w-full items-center justify-between md:max-w-screen-2xl">
        <Logo />

        {/* Navigation Actions */}
        <div className="flex w-full items-center justify-between space-x-4 md:block md:w-auto">
          <Button asChild size="sm" variant="outline">
            <Link href="/sign-in">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Get Taskify for free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
