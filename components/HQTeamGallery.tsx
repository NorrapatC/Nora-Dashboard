"use client";

import { useState } from "react";
import { PIPELINE_STAGES, type StageStatus } from "@/lib/pipeline";
import { usePipeline } from "@/contexts/PipelineContext";

const THAI: Record<string, string> = {
  nora: "โนร่า",  aria: "อาเรีย", mia:  "เมีย",   luna: "ลูน่า",
  sage: "เซจ",    vera: "เวร่า",  iris: "ไอริส",  zoe:  "โซอี้",
  rex:  "เร็กซ์", nova: "โนว่า", lyra: "ไลร่า",
};

const ABILITIES: Record<string, string[]> = {
  nora: ["Planning", "Agent Routing", "Kickoff Flow", "Session Mgmt", "Team Coordination"],
  aria: ["System Design", "ADR Writing", "Stack Selection", "Trade-off Analysis", "Roadmapping"],
  nova: ["Wireframing", "Design System", "UX Flow", "Accessibility", "Component Spec"],
  sage: ["Schema Design", "Query Optimize", "Migrations", "Index Strategy", "Prisma ORM"],
  mia:  ["React · Next.js", "App Router", "Tailwind CSS", "Component Arch", "Hydration Safety"],
  luna: ["REST API Design", "Zod Validation", "Auth Patterns", "Business Logic", "Error Handling"],
  vera: ["OWASP Top 10", "Threat Modeling", "Auth Hardening", "Input Sanitize", "Vuln Review"],
  iris: ["Code Review", "Refactoring", "Anti-Pattern Det.", "Standards Enforce", "Tech Debt"],
  zoe:  ["Test Strategy", "Edge Case Analysis", "Regression", "Bug Reporting", "QA Sign-off"],
  rex:  ["CI/CD Pipeline", "Zero-downtime Deploy", "Secrets Mgmt", "Vercel · Railway", "Monitoring"],
  lyra: ["README Writing", "API Docs", "Changelogs", "Runbooks", "User Guides"],
};

const STATUS_COLOR: Record<StageStatus, string> = {
  in_progress: "#16a34a", completed: "#0ea5e9",
  blocked: "#ef4444",     idle: "#3d4d68",
};
const STATUS_LABEL: Record<StageStatus, string> = {
  in_progress: "IN PROGRESS", completed: "COMPLETED",
  blocked: "BLOCKED",         idle: "IDLE",
};

const C = {
  bg: "#0a0e17", panel: "#0f1623", panelHi: "#131c2e",
  border: "#1e2a3d", text: "#cbd5e1", sub: "#5b6b85", dim: "#3d4d68",
  brand: "#c96442",
};
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const TAB_SZ   = 56;   // px — sprite size in tab bar
const DETAIL_SZ = 176; // px — sprite size in detail panel

export default function HQTeamGallery() {
  const { getEffectiveStatus } = usePipeline();
  const [selectedId, setSelectedId] = useState<string>("nora");

  const selected  = PIPELINE_STAGES.find(s => s.id === selectedId)!;
  const status    = getEffectiveStatus(selectedId);
  const dotColor  = STATUS_COLOR[status];
  const agColor   = selected.agent.color;

  const waitsFor  = selected.dependsOn;
  const unblocks  = PIPELINE_STAGES.filter(s => s.dependsOn.includes(selectedId)).map(s => s.id);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: C.bg }}>

      {/* ── Header ── */}
      <div
        className="flex shrink-0 items-center justify-between px-5"
        style={{ height: 36, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: C.brand, fontFamily: MONO, fontSize: 11, letterSpacing: 2 }}>
            ◆ TEAM GALLERY
          </span>
          <span style={{ color: C.dim, fontFamily: MONO, fontSize: 10 }}>
            · NRP UNIT · {PIPELINE_STAGES.length} MEMBERS
          </span>
        </div>
        <span style={{ color: C.dim, fontFamily: MONO, fontSize: 9 }}>
          {PIPELINE_STAGES.filter(s => getEffectiveStatus(s.id) === "in_progress").length} ACTIVE
        </span>
      </div>

      {/* ── Tab Bar ── */}
      <div
        className="flex shrink-0 gap-1 overflow-x-auto px-3 py-2"
        style={{ borderBottom: `1px solid ${C.border}`, scrollbarWidth: "none" }}
      >
        {PIPELINE_STAGES.map((s, i) => {
          const st  = getEffectiveStatus(s.id);
          const sel = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className="relative flex shrink-0 flex-col items-center"
              style={{
                padding: "6px 8px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${sel ? s.agent.color : "transparent"}`,
                background: sel ? `${s.agent.color}18` : "transparent",
                transition: "all 0.15s",
                minWidth: TAB_SZ + 16,
                outline: "none",
              }}
            >
              {/* Status dot */}
              <span
                className="absolute"
                style={{
                  top: 5, right: 5,
                  width: 6, height: 6, borderRadius: "50%",
                  background: STATUS_COLOR[st],
                  boxShadow: st === "in_progress" ? `0 0 5px ${STATUS_COLOR[st]}` : "none",
                }}
              />

              {/* Sprite */}
              <div
                style={{
                  width: TAB_SZ, height: TAB_SZ,
                  backgroundImage: `url('/team/animated/${s.id}.png')`,
                  backgroundSize: `${TAB_SZ * 4}px ${TAB_SZ}px`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "0 0",
                  imageRendering: "pixelated",
                  animation: "nrpTabBob 0.8s steps(4) infinite",
                  animationDelay: `${i * 0.07}s`,
                  borderRadius: 8,
                  opacity: sel ? 1 : 0.55,
                  filter: sel ? "none" : "saturate(0.3)",
                  transition: "opacity 0.15s, filter 0.15s",
                }}
              />

              {/* Name */}
              <span
                style={{
                  marginTop: 4, fontSize: 9.5, fontWeight: sel ? 700 : 500,
                  color: sel ? s.agent.color : C.sub,
                  fontFamily: MONO, letterSpacing: 0.5, whiteSpace: "nowrap",
                }}
              >
                {s.agent.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Detail Panel ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-7 p-6" style={{ maxWidth: 900 }}>

          {/* Sprite column */}
          <div className="flex shrink-0 flex-col items-center gap-3">
            {/* Frame */}
            <div
              style={{
                width: DETAIL_SZ, height: DETAIL_SZ,
                position: "relative", borderRadius: 18, overflow: "hidden",
                border: `2px solid ${agColor}50`,
                boxShadow: `0 0 32px ${agColor}20, inset 0 0 24px ${agColor}0c`,
                background: C.panelHi,
              }}
            >
              {/* Tint */}
              <div style={{
                position: "absolute", inset: 0,
                background: `${agColor}0a`, pointerEvents: "none",
              }} />
              {/* Animated sprite */}
              <div
                style={{
                  width: "100%", height: "100%",
                  backgroundImage: `url('/team/animated/${selectedId}.png')`,
                  backgroundSize: `${DETAIL_SZ * 4}px ${DETAIL_SZ}px`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "0 0",
                  imageRendering: "pixelated",
                  animation: "nrpDetailBob 0.8s steps(4) infinite",
                }}
              />
            </div>

            {/* Emoji + status */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 20 }}>{selected.agent.emoji}</span>
              <span
                style={{
                  fontFamily: MONO, fontSize: 9, letterSpacing: 1.5,
                  color: dotColor, padding: "2px 9px", borderRadius: 4,
                  border: `1px solid ${dotColor}44`, background: `${dotColor}10`,
                }}
              >
                {STATUS_LABEL[status]}
              </span>
            </div>
          </div>

          {/* Info column */}
          <div className="flex flex-1 flex-col gap-4 pt-1">

            {/* Name */}
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h2 style={{
                  fontSize: 30, fontWeight: 900, color: C.text,
                  lineHeight: 1, margin: 0,
                }}>
                  {selected.agent.name}
                </h2>
                <span style={{ fontSize: 18, fontWeight: 700, color: agColor }}>
                  {THAI[selectedId] ?? ""}
                </span>
              </div>
              <p style={{
                margin: "5px 0 0",
                fontSize: 10, color: C.sub,
                fontFamily: MONO, letterSpacing: 1.5,
              }}>
                {selected.agent.role.toUpperCase()}
              </p>
            </div>

            {/* Pipeline Stage */}
            <div
              style={{
                padding: "11px 14px", borderRadius: 10,
                border: `1px solid ${C.border}`,
                background: C.panel,
              }}
            >
              <p style={{ margin: 0, fontSize: 9, color: C.dim, fontFamily: MONO, letterSpacing: 1.5 }}>
                PIPELINE STAGE
              </p>
              <p style={{ margin: "4px 0 2px", fontSize: 13, fontWeight: 700, color: C.text }}>
                {selected.label}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: C.sub, lineHeight: 1.5 }}>
                {selected.description}
              </p>
            </div>

            {/* Abilities */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 9, color: C.dim, fontFamily: MONO, letterSpacing: 1.5 }}>
                ABILITIES
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(ABILITIES[selectedId] ?? []).map(ab => (
                  <span
                    key={ab}
                    style={{
                      fontSize: 10, fontFamily: MONO,
                      padding: "3px 11px", borderRadius: 20,
                      border: `1px solid ${agColor}44`,
                      background: `${agColor}14`,
                      color: agColor,
                    }}
                  >
                    {ab}
                  </span>
                ))}
              </div>
            </div>

            {/* Dependencies */}
            {(waitsFor.length > 0 || unblocks.length > 0) && (
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {waitsFor.length > 0 && (
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 9, color: C.dim, fontFamily: MONO, letterSpacing: 1.5 }}>
                      WAITS FOR
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {waitsFor.map(depId => {
                        const dep = PIPELINE_STAGES.find(s => s.id === depId);
                        if (!dep) return null;
                        return (
                          <button
                            key={depId}
                            onClick={() => setSelectedId(depId)}
                            style={{
                              fontSize: 10, fontFamily: MONO, cursor: "pointer",
                              padding: "3px 9px", borderRadius: 5,
                              border: `1px solid ${C.border}`,
                              background: C.panel, color: C.sub,
                            }}
                          >
                            {dep.agent.emoji} {dep.agent.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {unblocks.length > 0 && (
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 9, color: C.dim, fontFamily: MONO, letterSpacing: 1.5 }}>
                      UNBLOCKS
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {unblocks.map(depId => {
                        const dep = PIPELINE_STAGES.find(s => s.id === depId);
                        if (!dep) return null;
                        return (
                          <button
                            key={depId}
                            onClick={() => setSelectedId(depId)}
                            style={{
                              fontSize: 10, fontFamily: MONO, cursor: "pointer",
                              padding: "3px 9px", borderRadius: 5,
                              border: `1px solid ${dep.agent.color}44`,
                              background: `${dep.agent.color}10`,
                              color: dep.agent.color,
                            }}
                          >
                            {dep.agent.emoji} {dep.agent.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes nrpTabBob    { to { background-position-x: -${TAB_SZ    * 4}px; } }
        @keyframes nrpDetailBob { to { background-position-x: -${DETAIL_SZ * 4}px; } }
      `}</style>
    </div>
  );
}
