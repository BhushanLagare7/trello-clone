import Image from "next/image";
import Link from "next/link";

/**
 * Clickable branding component that links to the home page.
 * Hidden on mobile screens, visible on medium (md) screens and up.
 */
export const Logo = () => {
  return (
    <Link href="/">
      <div className="hidden items-center gap-x-2 transition hover:opacity-75 md:flex">
        <Image alt="Logo" height={30} src="/logo.svg" width={30} />
        <p className="pb-1 text-lg font-bold text-neutral-700">Taskify</p>
      </div>
    </Link>
  );
};
