// components/GardenEntryClient.tsx
//
// Renders the full home page layout and auto-opens GardenModal
// to a specific file. Used by app/garden/[id]/page.tsx.
//
// Why a separate component and not just page.tsx?
// - The home page is a large "use client" component
// - This lets us pass the initialFileId cleanly without
//   duplicating all the home page state logic

"use client";

import { useEffect, useState } from "react";
import Home from "@/app/page"; // re-uses your existing Home component

interface Props {
  initialFileId: string;
}

export default function GardenEntryClient({ initialFileId }: Props) {
  // Signal to the Home component to open the garden on mount
  // We use a custom event so Home's existing useEffect picks it up
  useEffect(() => {
    // Small delay so the Home component has time to mount
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("open-garden-file", { detail: { fileId: initialFileId } })
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [initialFileId]);

  return <Home />;
}
