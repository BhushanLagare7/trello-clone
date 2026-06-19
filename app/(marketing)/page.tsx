import { Poppins } from "next/font/google";
import Link from "next/link";

import { MedalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Load Poppins font with all weights for body text
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

/**
 * MarketingPage: The landing page component featuring the value proposition,
 * branding, and a Call-to-Action for signing up.
 */
const MarketingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Header Section */}
      <div className="flex flex-col items-center justify-center font-bold">
        <div className="mb-4 flex items-center rounded-full border bg-amber-100 p-4 text-amber-700 uppercase shadow-sm">
          <MedalIcon className="mr-2 size-6" />
          No 1 task management
        </div>
        <h1 className="mb-6 text-center text-3xl text-neutral-800 md:text-6xl">
          Taskify helps team move
        </h1>
        <div className="w-fit rounded-md bg-linear-to-r from-fuchsia-600 to-pink-600 p-2 px-4 pb-4 text-3xl text-white md:text-6xl">
          work forward.
        </div>
      </div>

      {/* Description / Sub-headline */}
      <div
        className={cn(
          "mx-auto mt-4 max-w-xs text-center text-sm text-neutral-400 md:max-w-2xl md:text-xl",
          poppins.className,
        )}
      >
        Collaborate, manage projects, and reach new productivity peaks. From
        high rises to the home office, the way your team works is unique -
        accomplish it all with Taskify.
      </div>

      {/* Call to Action Button */}
      <Button asChild className="mt-6" size="lg">
        <Link href="/sign-up">Get Taskify for free</Link>
      </Button>
    </div>
  );
};

export default MarketingPage;
