// components/blog/SeriesNav.tsx
import Link from "next/link";

interface SeriesPost { title: string; slug: string }
interface SeriesProps {
  series: { name: string; slug: string; posts: { edges: { node: SeriesPost }[] } };
  currentSlug: string;
}

export default function SeriesNav({ series, currentSlug }: SeriesProps) {
  const posts   = series.posts.edges.map(e => e.node);
  const currIdx = posts.findIndex(p => p.slug === currentSlug);
  const prev    = posts[currIdx - 1] ?? null;
  const next    = posts[currIdx + 1] ?? null;

  return (
    <div className="border border-dashed border-border-strong p-5" style={{ borderRadius: 2 }}>
      {/* Series header */}
      <div className="font-mono text-[9px] text-ink-faint tracking-widest uppercase mb-3">
        Series: {series.name} — {currIdx + 1} of {posts.length}
      </div>

      {/* All posts in series */}
      <div className="space-y-1 mb-5">
        {posts.map((p, i) => {
          const isCurrent = p.slug === currentSlug;
          return (
            <div key={p.slug} className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-ink-faint w-4 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              {isCurrent ? (
                <span className="font-mono text-[10px] text-accent font-bold">
                  → {p.title}
                </span>
              ) : (
                <Link href={`/blog/${p.slug}`} className="font-mono text-[10px] text-ink-muted hover:text-accent transition-colors">
                  {p.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Prev / next */}
      <div className="flex justify-between gap-4 pt-4 border-t border-dashed border-border-strong">
        {prev ? (
          <Link href={`/blog/${prev.slug}`} className="font-mono text-[10px] text-ink-muted hover:text-accent transition-colors max-w-[45%]">
            <div className="text-ink-faint mb-0.5">← previous</div>
            <div className="truncate">{prev.title}</div>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/blog/${next.slug}`} className="font-mono text-[10px] text-ink-muted hover:text-accent transition-colors text-right max-w-[45%]">
            <div className="text-ink-faint mb-0.5">next →</div>
            <div className="truncate">{next.title}</div>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
