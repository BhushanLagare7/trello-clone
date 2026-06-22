import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
  /** The element that triggers the tooltip on hover */
  children: React.ReactNode;
  /** The text content to display inside the tooltip */
  description: string;
  /** Position of the tooltip relative to the trigger */
  side?: "left" | "right" | "top" | "bottom";
  /** Distance in pixels from the trigger */
  sideOffset?: number;
}

/**
 * A reusable wrapper component that provides a tooltip "hint" for its children.
 */
export const Hint = ({
  children,
  description,
  side = "bottom",
  sideOffset = 0,
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          className="max-w-55 text-xs wrap-break-word"
          side={side}
          sideOffset={sideOffset}
        >
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
