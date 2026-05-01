// Changes to apply to page.tsx (Home component)
// Two additions only — everything else stays identical to your current file.

// ─── ADDITION 1 ──────────────────────────────────────────────────────────
// Add this useEffect inside the Home component, alongside your existing effects.
// It listens for the custom event fired by GardenEntryClient when navigating
// to a /garden/[id] URL directly.

useEffect(() => {
  const handler = (e: Event) => {
    const { fileId } = (e as CustomEvent<{ fileId: string }>).detail;
    if (fileId) {
      setActiveGardenFileId(fileId);
      setIsGardenOpen(true);
    }
  };
  window.addEventListener("open-garden-file", handler);
  return () => window.removeEventListener("open-garden-file", handler);
}, []);


// ─── ADDITION 2 ──────────────────────────────────────────────────────────
// The existing URL-based garden opening (reads ?garden= query param) 
// can stay as-is. It's now used as a fallback for older shared links.
// The new /garden/[id] route is the canonical sharing path.


// ─── NO OTHER CHANGES NEEDED IN page.tsx ─────────────────────────────────
// The GardenModal already:
//   - calls window.history.replaceState({}, '', `/garden/${activeFileId}`)
//   - has the share button that copies window.location.origin + '/garden/' + activeFileId
//   - shows a toast on copy
// All of that already works with the new route.
