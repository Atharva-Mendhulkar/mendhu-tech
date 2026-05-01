"use client";

import { useEffect } from "react";
import Home from "@/app/page";

interface Props {
  initialFileId: string;
}

export default function GardenEntryClient({ initialFileId }: Props) {
  // Signal to the Home component to open the garden on mount
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
