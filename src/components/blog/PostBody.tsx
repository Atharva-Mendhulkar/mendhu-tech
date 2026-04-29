// components/blog/PostBody.tsx
"use client";
import "katex/dist/katex.min.css";

interface Props { html: string }

export default function PostBody({ html }: Props) {
  return (
    <div
      className="post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
