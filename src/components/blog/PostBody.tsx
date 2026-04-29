// components/blog/PostBody.tsx
"use client";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Props { html: string }

export default function PostBody({ html }: Props) {
  // Simple heuristic: contains tags -> HTML. Else Markdown.
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(html) && html.includes("<p");

  if (isHtml) {
    return (
      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="post-body prose dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {html}
      </ReactMarkdown>
    </div>
  );
}
