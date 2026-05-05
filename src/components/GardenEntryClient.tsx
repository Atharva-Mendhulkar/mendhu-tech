"use client";

import { useEffect } from "react";
import HomeClient from "@/components/HomeClient";
import { Post } from "@/lib/hashnode";

interface Props {
  initialFileId: string;
  initialPosts: Post[];
}

export default function GardenEntryClient({ initialFileId, initialPosts }: Props) {
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

  return <HomeClient initialPosts={initialPosts} />;
}
