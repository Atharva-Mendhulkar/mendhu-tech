// app/blog/layout.tsx
// Scoped layout for the /blog route — imports the blog styles.

import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
