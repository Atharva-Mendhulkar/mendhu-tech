// ── VAULT PARSER UPDATE ───────────────────────────────────────────────────
// The only change needed in parse-vault.mjs is to ensure the `id` field
// generated for each node is URL-safe, since it becomes the /garden/[id] path.
//
// Replace the fileToId function with this version:

function fileToId(filePath, rootDir) {
  return path
    .relative(rootDir, filePath)
    .replace(/\.md$/, "")
    .replace(/[\\/]+/g, "_")      // path separators → underscore
    .replace(/\s+/g, "_")         // spaces → underscore
    .replace(/[^a-zA-Z0-9_-]/g, "") // strip anything else
    .toLowerCase();
}

// ── WHAT THIS GIVES YOU ───────────────────────────────────────────────────
//
// Vault file path                 → Garden URL
// ──────────────────────────────────────────────────────────────────────────
// vault/PINN.md                   → mendhu.tech/garden/pinn
// vault/AGENTS.md                 → mendhu.tech/garden/agents
// vault/air_quality/source_id.md  → mendhu.tech/garden/air_quality_source_id
// vault/systems/kphd.md           → mendhu.tech/garden/systems_kphd
//
// The URL is generated automatically from the file path — no manual work.
// Push a new .md to vault/ → GitHub Action runs parser → new route exists.
//
// ── FRONTMATTER TIP ──────────────────────────────────────────────────────
// Add `id:` to frontmatter to override the auto-generated slug:
//
// ---
// title: K-PHD — Kernel Predictive Hang Detector
// id: kphd                   ← use this as the URL instead of systems_kphd
// tags: [systems, kernel]
// description: Kernel module for nanosecond hang prediction
// ---
//
// Update fileToId in the parser to check fm.id first:

function fileToIdWithOverride(filePath, rootDir, frontmatter) {
  if (frontmatter.id && typeof frontmatter.id === "string") {
    return frontmatter.id
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase();
  }
  return path
    .relative(rootDir, filePath)
    .replace(/\.md$/, "")
    .replace(/[\\/]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
}
