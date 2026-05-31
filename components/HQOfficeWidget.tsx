"use client";
// Embeddable, sized version of the NRP pixel office for the homepage.
// WHY a separate wrapper (not reusing app/hq/page.tsx directly):
// the /hq page is a full-screen layout. The homepage needs the same Phaser game
// inside a fixed-height card. This component owns the dynamic import + card chrome
// so app/page.tsx stays clean and never pulls Phaser into its initial bundle.

import dynamic from "next/dynamic";

// WHY dynamic + ssr:false: Phaser touches window/document at import time, which
// crashes during SSR. Same pattern as app/hq/page.tsx. The loading fallback keeps
// the card from collapsing while the chunk downloads.
const HQGame = dynamic(() => import("@/components/HQGame"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ backgroundColor: "#1a1a19" }}>
      <div className="text-center space-y-3">
        <div
          className="mx-auto size-7 animate-spin rounded-full border-2"
          style={{ borderColor: "#3d3d38", borderTopColor: "#c96442" }}
        />
        <p style={{ color: "#4a4a44", fontSize: "11px", fontFamily: "monospace" }}>Loading HQ...</p>
      </div>
    </div>
  ),
});

export default function HQOfficeWidget() {
  return (
    <div
      className="rounded-2xl bg-white shadow-sm overflow-hidden"
      style={{ border: "1px solid #ede9e3" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #f0ece6" }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full" style={{ background: "#16a34a" }} />
          <span className="text-sm font-bold text-slate-800">NRP HQ</span>
          <span className="text-xs text-slate-400">— Live Office · 11 agents</span>
        </div>
        <a
          href="/hq"
          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
          style={{ background: "#fdf3ef", color: "#c96442", border: "1px solid #f5d6c8" }}
        >
          เปิดเต็มจอ →
        </a>
      </div>

      {/* Game canvas — relative box; HQGame fills it via position:absolute inset:0 */}
      <div className="relative" style={{ height: 440, backgroundColor: "#1a1a19" }}>
        <HQGame />
      </div>
    </div>
  );
}
