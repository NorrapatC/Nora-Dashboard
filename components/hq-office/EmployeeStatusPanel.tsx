"use client"
// EmployeeStatusPanel.tsx — Slide-in detail panel when an employee is selected
//
// WHY position: absolute right-0 — keeps the panel overlaid on the office map
//   without pushing the layout, matching the "side drawer" pattern. The map
//   continues to live-update behind it.

import { EMPLOYEES, ACTIVITY_LABELS, MOOD_LABELS, MOOD_COLORS } from "./OfficeData"
import type { EmployeeState, HistoryEntry } from "./types"

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace"

type Props = {
  employeeId: string
  state: EmployeeState
  onClose: () => void
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function ProductivityBar({ value }: { value: number }) {
  const color =
    value >= 70 ? "#16a34a" :
    value >= 40 ? "#f59e0b" :
    "#ef4444"

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 10, fontFamily: MONO, color: "#64748b", letterSpacing: 0.5 }}>
          PRODUCTIVITY
        </span>
        <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color }}>
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "#f1f5f9",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: color,
            borderRadius: 999,
            transition: "width 0.6s ease, background 0.4s ease",
          }}
        />
      </div>
    </div>
  )
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span style={{ fontSize: 9, fontFamily: MONO, color: "#94a3b8", minWidth: 60 }}>
        {formatTime(entry.timestamp)}
      </span>
      <span style={{ fontSize: 11, flex: 1 }}>
        {ACTIVITY_LABELS[entry.activity]}
      </span>
      <span
        style={{
          fontSize: 9,
          fontFamily: MONO,
          color: MOOD_COLORS[entry.mood],
          letterSpacing: 0.5,
        }}
      >
        {entry.mood.toUpperCase()}
      </span>
    </div>
  )
}

export default function EmployeeStatusPanel({ employeeId, state, onClose }: Props) {
  const emp = EMPLOYEES.find((e) => e.id === employeeId)
  if (!emp) return null

  const recentHistory = [...state.activityHistory].reverse().slice(0, 8)

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 280,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(8px)",
        borderLeft: "1px solid #f5d6c8",
        borderRadius: "0 0 0 16px",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
        overflowY: "auto",
        zIndex: 50,
        // Slide in from right
        animation: "panel-slide-in 0.2s ease-out",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Keyframe injected inline — small enough to not warrant a separate file */}
      <style>{`
        @keyframes panel-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid #f5d6c8",
          background: "#fdf3ef",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {/* Portrait */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid #f5d6c8",
            flexShrink: 0,
            background: "#f1f5f9",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={emp.portraitSrc}
            alt={emp.name}
            width={64}
            height={64}
            style={{ imageRendering: "pixelated", objectFit: "cover", width: 64, height: 64 }}
          />
        </div>

        {/* Name + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              color: "#1e1c1a",
              letterSpacing: 0.5,
            }}
          >
            {emp.name}
          </div>
          <div style={{ fontSize: 11, color: "#c96442", fontWeight: 600, marginTop: 2 }}>
            {emp.thaiRole}
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>
            {emp.role}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: "1px solid #f5d6c8",
            background: "white",
            color: "#94a3b8",
            fontSize: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontWeight: 700,
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Current status badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#fdf3ef",
              border: "1px solid #f5d6c8",
              color: "#c96442",
              fontWeight: 600,
            }}
          >
            {ACTIVITY_LABELS[state.activity]}
          </span>
          <span
            style={{
              fontSize: 11,
              padding: "4px 10px",
              borderRadius: 999,
              background: MOOD_COLORS[state.mood] + "18",
              border: `1px solid ${MOOD_COLORS[state.mood]}40`,
              color: MOOD_COLORS[state.mood],
              fontWeight: 600,
            }}
          >
            {MOOD_LABELS[state.mood]}
          </span>
        </div>

        {/* Productivity bar */}
        <ProductivityBar value={state.productivity} />

        {/* Room info */}
        <div>
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: "#64748b",
              letterSpacing: 0.5,
              display: "block",
              marginBottom: 4,
            }}
          >
            ROOM
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#1e1c1a",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {emp.roomId === "boss" ? "Boss Room" :
             emp.roomId === "nora" ? "Nora's Office" :
             emp.roomId === "dev"  ? "Developer Zone" :
             emp.roomId === "sec"  ? "Security Zone" :
             emp.roomId === "design" ? "Design Room" :
             emp.roomId === "qa"   ? "QA & Docs" :
             emp.roomId === "ops"  ? "Operations" :
             emp.roomId}
          </span>
        </div>

        {/* Activity history */}
        <div>
          <span
            style={{
              fontSize: 10,
              fontFamily: MONO,
              color: "#64748b",
              letterSpacing: 0.5,
              display: "block",
              marginBottom: 8,
            }}
          >
            ACTIVITY HISTORY
          </span>
          {recentHistory.length === 0 ? (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>No activity yet</span>
          ) : (
            <div>
              {recentHistory.map((entry, i) => (
                <HistoryRow key={i} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
