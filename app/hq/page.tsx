"use client";
// /hq — NRP HQ Command Center.
// WHY "use client": HQCommandCenter embeds the Phaser office via dynamic(ssr:false),
// which requires a client boundary. The page is a thin full-height shell; the HUD
// (header, team status, activity feed, metrics) + game all live in HQCommandCenter.
import dynamic from "next/dynamic";

// Dynamic so the (heavy) command center + Phaser bundle stay out of the server pass.
const HQCommandCenter = dynamic(() => import("@/components/HQCommandCenter"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "#0a0e17" }}>
      <div className="text-center space-y-3">
        <div className="mx-auto size-8 animate-spin rounded-full border-2"
          style={{ borderColor: "#1e2a3d", borderTopColor: "#22d3ee" }} />
        <p style={{ color: "#3d5170", fontSize: "11px", fontFamily: "monospace" }}>BOOTING COMMAND CENTER...</p>
      </div>
    </div>
  ),
});

export default function HQPage() {
  return (
    <div style={{ background: "#0a0e17", height: "100vh" }}>
      <HQCommandCenter />
    </div>
  );
}
