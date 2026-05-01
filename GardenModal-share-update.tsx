// ── SHARE BUTTON REPLACEMENT in GardenModal.tsx ──────────────────────────
// Find the existing share button block and replace it with this.
// The rest of GardenModal.tsx stays identical.

// FIND this block (~line 430 in your current GardenModal.tsx):
/*
<button 
  onClick={() => {
    const url = window.location.origin + '/garden/' + activeFileId;
    navigator.clipboard.writeText(url);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  }}
  title="Copy share link"
  className="p-1 hover:text-accent transition-colors flex items-center justify-center relative"
>
  <Share2 size={12} className="text-ink-faint hover:text-accent"/>
</button>
*/

// REPLACE WITH this improved version:

<div className="flex items-center gap-2">
  {/* Share button — copies canonical URL to clipboard */}
  <button
    onClick={() => {
      const url = `${window.location.origin}/garden/${activeFileId}`;
      navigator.clipboard.writeText(url).then(() => {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2500);
      });
      // Update the browser URL to match the shared file
      window.history.replaceState({}, "", `/garden/${activeFileId}`);
    }}
    title={`Copy link: mendhu.tech/garden/${activeFileId}`}
    className="group flex items-center gap-1.5 font-mono text-[9px] text-ink-faint hover:text-accent transition-colors px-2 py-1 border border-dashed border-transparent hover:border-accent rounded-[2px]"
  >
    <Share2 size={11} />
    <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {`/garden/${activeFileId}`}
    </span>
  </button>
</div>

// ── TOAST REPLACEMENT ─────────────────────────────────────────────────────
// The existing toast at the bottom of GardenModal is already good.
// Just update the toast text to show the actual URL being copied:

// FIND:
// <span className="font-mono text-[11px] tracking-wider text-ink font-medium uppercase">link copied to clipboard</span>

// REPLACE WITH:
// <span className="font-mono text-[11px] tracking-wider text-ink font-medium">
//   mendhu.tech/garden/{activeFileId}
// </span>

// ── WHAT HAPPENS END-TO-END ───────────────────────────────────────────────
//
// 1. User opens GardenModal → navigates to any file
//    → URL silently updates to /garden/pinn_abstract
//
// 2. User clicks Share button
//    → Copies "https://mendhu.tech/garden/pinn_abstract" to clipboard
//    → Toast shows "mendhu.tech/garden/pinn_abstract"
//
// 3. Recipient opens the link
//    → Next.js serves app/garden/[id]/page.tsx
//    → OG metadata: "JointPINN — Knowledge Garden · Atharva Mendhulkar"
//    → GardenEntryClient fires open-garden-file event
//    → Home opens GardenModal pre-scrolled to pinn_abstract
//
// 4. New vault file pushed:
//    vault/new_research.md → GitHub Action → parse-vault.mjs
//    → new node in research.json with id: "new_research"
//    → next build generates /garden/new_research automatically
//    → Share button works immediately, no manual route needed
