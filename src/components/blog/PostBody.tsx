// components/blog/PostBody.tsx
"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { rehypeHeadingIds } from "@/lib/headingIds";
import Image from "next/image";

interface Props { html: string }

export default function PostBody({ html }: Props) {
  return (
    <>
      <style>{`
        .post-body h1 { font-family: var(--font-serif); font-size: 2rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; color: var(--ink); }
        .post-body h2 { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 500; margin-top: 1.75rem; margin-bottom: 0.75rem; color: var(--ink); border-bottom: 1px dashed var(--border-strong); padding-bottom: 0.5rem; }
        .post-body h3 { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 500; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--ink); }
        .post-body h2,
        .post-body h3 { scroll-margin-top: 96px; }
        .post-body p { font-family: var(--font-serif); font-size: 16px; font-weight: 400; line-height: 1.8; margin-bottom: 1.25rem; color: var(--ink-muted); }
        .post-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .post-body ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .post-body li { font-family: var(--font-serif); font-size: 16px; line-height: 1.8; margin-bottom: 0.5rem; color: var(--ink-muted); }
        .post-body code { font-family: var(--font-mono); font-size: 13px; color: var(--accent); background-color: rgba(120, 120, 120, 0.1); padding: 0.125rem 0.375rem; border-radius: 4px; }
        .post-body pre { background-color: rgba(0,0,0,0.03); border: 1px solid var(--border-strong); padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1.25rem; font-family: var(--font-mono); }
        .post-body pre code { background-color: transparent; padding: 0; color: inherit; }
        .post-body blockquote { border-left: 3px solid var(--accent); padding-left: 1.25rem; font-style: italic; color: var(--ink-muted); margin-bottom: 1.25rem; margin-top: 1.25rem; }
        .post-body a { color: var(--accent); text-decoration: underline; text-underline-offset: 4px; transition: opacity 0.2s; }
        .post-body a:hover { opacity: 0.8; }
        .post-body img { border-radius: 4px; margin: 2rem auto; max-width: 100%; height: auto; display: block; border: 1px solid var(--border-strong); }
      `}</style>

      <div className="post-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHeadingIds]}
          components={{
            img: ({ src, alt, ...props }) => {
              if (!src) return null;
              return (
                <span className="block my-8 border border-dashed border-border-strong overflow-hidden" style={{ borderRadius: 2, backgroundColor: "rgba(0,0,0,0.02)" }}>
                  <img src={src} alt={alt || ''} className="w-full h-auto block" {...props as any} />
                </span>
              );
            }
          }}
        >
          {html}
        </ReactMarkdown>
      </div>
    </>
  );
}
