type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const HEADING_TAGS = new Set(["h2", "h3"]);

function textContent(node: HastNode): string {
  if (node.type === "text") return String(node.value ?? "");
  return node.children?.map(textContent).join("") ?? "";
}

export function createHeadingSlugger() {
  const seen = new Map<string, number>();

  return (value: string) => {
    const base =
      value
        .trim()
        .toLowerCase()
        .replace(/&amp;/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "heading";

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    return count === 0 ? base : `${base}-${count}`;
  };
}

export function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const slug = createHeadingSlugger();
    const used = new Set<string>();

    function uniqueId(candidate: string) {
      const base =
        candidate
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "") || "heading";

      let id = base;
      let index = 1;
      while (used.has(id)) {
        id = `${base}-${index}`;
        index += 1;
      }
      used.add(id);
      return id;
    }

    function visit(node: HastNode) {
      if (node.type === "element" && node.tagName && HEADING_TAGS.has(node.tagName)) {
        const properties = node.properties ?? {};
        const existingId = typeof properties.id === "string" ? properties.id : "";
        const generatedId = existingId || slug(textContent(node));

        node.properties = {
          ...properties,
          id: uniqueId(generatedId),
        };
      }

      node.children?.forEach(visit);
    }

    visit(tree);
  };
}
