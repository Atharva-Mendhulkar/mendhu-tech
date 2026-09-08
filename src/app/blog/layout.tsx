// app/blog/layout.tsx
// Scoped layout for the /blog route — imports the blog styles.
// The theme toggle lives inline next to the page heading (blog/page.tsx).

import type { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
