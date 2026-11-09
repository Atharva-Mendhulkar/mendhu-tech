"use client";

import { useEffect } from "react";
import HomeClient from "@/components/HomeClient";
import { MediumPost } from "@/lib/medium";

interface Props {
  initialProjectId: string;
  initialPosts: MediumPost[];
}

export default function ProjectEntryClient({ initialProjectId, initialPosts }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("open-project-modal", { detail: { projectId: initialProjectId } })
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [initialProjectId]);

  return <HomeClient initialPosts={initialPosts} />;
}
