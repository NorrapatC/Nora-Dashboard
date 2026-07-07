"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import IsoOffice from "@/components/IsoOffice";

const HQCommandCenter = dynamic(() => import("@/components/HQCommandCenter"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "#0a0e17" }}>
      <p style={{ color: "#3d5170", fontSize: 11, fontFamily: "monospace" }}>BOOTING COMMAND CENTER…</p>
    </div>
  ),
});

const HQTeamGallery = dynamic(() => import("@/components/HQTeamGallery"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "#0a0e17" }}>
      <p style={{ color: "#3d5170", fontSize: 11, fontFamily: "monospace" }}>LOADING GALLERY…</p>
    </div>
  ),
});

// Heavy component — lazy load so it doesn't affect initial bundle
const HQOffice = dynamic(() => import("@/components/hq-office/HQOffice"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "#f9f7f4" }}>
      <p style={{ color: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}>LOADING OFFICE…</p>
    </div>
  ),
});

type View = "command" | "gallery" | "office";
type OfficeSubView = "iso" | "floor";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const ISO_AGENTS = PIPELINE_STAGES.map((s) => ({ id: s.id, name: s.agent.name, color: s.agent.color }));

export default function HQPage() {
  const [view, setView]           = useState<View>("command");
  const [officeView, setOfficeView] = useState<OfficeSubView>("iso");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: "#0a0e17" }}>
      {/* ── Main tab bar ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 shrink-0 px-4"
        style={{ height: 36, borderBottom: "1px solid #1e2a3d", background: "#0a0e17" }}
      >
        <Tab active={view === "command"} onClick={() => setView("command")}>◆ COMMAND CENTER</Tab>
        <Tab active={view === "gallery"} onClick={() => setView("gallery")}>▤ TEAM GALLERY</Tab>
        <Tab active={view === "office"}  onClick={() => setView("office")}>⊞ OFFICE</Tab>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1 flex flex-col">
        {view === "command" && <HQCommandCenter />}
        {view === "gallery" && <HQTeamGallery />}

        {view === "office" && (
          <>
            {/* Office sub-tab bar */}
            <div
              style={{
                height: 30,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "0 12px",
                background: "#0c1220",
                borderBottom: "1px solid #1e2a3d",
                flexShrink: 0,
              }}
            >
              <SubTab active={officeView === "iso"}   onClick={() => setOfficeView("iso")}>
                ◈ ISO VIEW
              </SubTab>
              <SubTab active={officeView === "floor"} onClick={() => setOfficeView("floor")}>
                ⊞ FLOOR PLAN
              </SubTab>
            </div>

            {/* Office content */}
            <div className="relative min-h-0 flex-1">
              {officeView === "iso" && (
                <IsoOffice
                  agents={ISO_AGENTS}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
                />
              )}
              {officeView === "floor" && <HQOffice />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Tab components ──────────────────────────────────────────────────────────────

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: MONO, fontSize: 10, letterSpacing: 1.5,
        padding: "4px 12px", borderRadius: 6,
        border: `1px solid ${active ? "#c96442" : "transparent"}`,
        background: active ? "#c9644220" : "transparent",
        color: active ? "#c96442" : "#3d5170",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function SubTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: MONO, fontSize: 9, letterSpacing: 1.2,
        padding: "3px 10px", borderRadius: 4,
        border: `1px solid ${active ? "#c9644260" : "transparent"}`,
        background: active ? "#c9644215" : "transparent",
        color: active ? "#c96442" : "#3d5170",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
