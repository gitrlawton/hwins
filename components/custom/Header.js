"use client";

import Link from "next/link";
import { Info, Trophy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

export default function Header() {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const toggleTooltip = () => {
    setIsTooltipOpen(!isTooltipOpen);
  };

  return (
    <header className="bg-neutral-100 dark:bg-stone-950 border-b border-neutral-300 dark:border-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex flex-col">
            <div className="flex items-center dark:text-stone-200">
              <span className="text-3xl font-semibold tracking-wider">
                HWINS
              </span>
              <Trophy className="h-6 w-6 ml-2 text-foreground" />
            </div>
            <span className="text-sm text-muted-foreground italic">
              winning hackathon projects
            </span>
          </div>
          <TooltipProvider>
            <Tooltip
              open={isTooltipOpen}
              onOpenChange={setIsTooltipOpen}
              delayDuration={0}
            >
              <TooltipTrigger asChild>
                <button className="p-2 rounded-full" onClick={toggleTooltip}>
                  <Info className="h-5 w-5 dark:text-neutral-500" />
                  <span className="sr-only">Information</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                sideOffset={5}
                className="bg-white text-black dark:bg-stone-900 dark:text-stone-200 border border-gray-300 dark:border-gray-800 drop-shadow-md"
              >
                <p>This site is a work in progress.</p>
                <p>
                  Follow on{" "}
                  <Link
                    href="https://www.linkedin.com/in/rlawton714/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    LinkedIn
                  </Link>{" "}
                  for updates.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
