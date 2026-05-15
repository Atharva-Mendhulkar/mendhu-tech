# Medium Blog Integration — mendhu.tech

Complete drop-in replacement for the Hashnode integration.
No API keys. No GraphQL. Just Medium's public RSS feed.

---

## Files included

```
lib/
  medium.ts                   ← fetcher + types (replaces lib/hashnode.ts)

app/blog/
  layout.tsx                  ← imports scoped CSS
  page.tsx                    ← server component, ISR-cached
  blog.css                    ← all styles (EB Garamond + JetBrains Mono)

components/blog/
  BlogCard.tsx                ← single post card
  BlogGrid.tsx                ← client component with tag filtering
```

---

## Migration steps

### 1. Copy files
Drop the files above into your project at the matching paths.

### 2. Set your Medium username
In `.env.local` (or Vercel env vars):
```
NEXT_PUBLIC_MEDIUM_USERNAME=your-medium-handle
```
No `@` prefix. If you skip this, it defaults to `mendhu`.

### 3. Delete Hashnode files
```bash
rm lib/hashnode.ts          # or wherever your Hashnode fetcher lives
```

### 4. Remove the old env var
In your Vercel dashboard → Settings → Environment Variables:
- **Delete** `HASHNODE_PUBLICATION_ID`
- **Add** `NEXT_PUBLIC_MEDIUM_USERNAME` = your handle

### 5. Update any navbar/links
If you have a `<Link href="/blog">` anywhere, it already works.
If you linked to Hashnode externally, update those to `https://medium.com/@yourhandle`.

---

## How it works

```
Medium RSS feed
  → rss2json.com API (free, 10k req/day, converts XML → JSON)
    → getMediumPosts() in lib/medium.ts
      → cached by Next.js for 1 hour (ISR revalidate)
        → BlogPage (server component)
          → BlogGrid (client, handles tag filtering)
            → BlogCard × N
```

**Why rss2json?**  
Medium's RSS is raw XML. Parsing XML server-side in Edge/Node is doable but messy.
rss2json gives us clean JSON with thumbnails, categories, and pub dates already
normalised — for free, with a generous rate limit.

**No full post bodies**  
Medium's RSS only provides a truncated HTML preview, not the full article.
Cards link out to Medium with `target="_blank"`. This is intentional — Medium
handles reading mode, dark mode, estimated read time, claps, etc.

---

## Customisation

| Thing to change | Where |
|---|---|
| Posts per page | `count=20` query param in `lib/medium.ts` → `getMediumPosts` |
| Cache duration | `CACHE_REVALIDATE` constant in `lib/medium.ts` |
| Accent colour | `--blog-accent` in `blog.css` |
| Excerpt length | `getExcerpt(post.description, 150)` in `BlogCard.tsx` |
| Tag filter | Already built into `BlogGrid.tsx` |
| Page heading | `blog-header` section in `app/blog/page.tsx` |
