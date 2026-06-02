"use client";
// /hq — "The Studio" Mission Control (warm, single page). The old neon-dark
// HQCommandCenter (4-view toggle) is replaced by HQStudio. HQStudio is light
// (SVG isometric office, no WebGL) so it can be imported directly.
import HQStudio from "@/components/HQStudio";

export default function HQPage() {
  return (
    <div style={{ height: "100vh", background: "#f3efe6" }}>
      <HQStudio />
    </div>
  );
}
