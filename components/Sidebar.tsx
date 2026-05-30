"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const CLAUDE_ORANGE = "#c96442";

const NAV = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/hq",
    label: "HQ",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    href: "/goals",
    label: "Goals",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/freelance",
    label: "Freelance",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/skills",
    label: "Skills",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  // Mobile drawer state. On md+ the sidebar is always visible (md:translate-x-0)
  // and this state is irrelevant; on mobile it slides in over a backdrop.
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes (mobile nav tap → navigate → close).
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Mobile hamburger (floating — doesn't affect page layout) ── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-3 top-3 z-50 flex size-10 items-center justify-center rounded-xl shadow-lg md:hidden"
        style={{ background: "#1a1a19", border: "1px solid #2d2d2a" }}
      >
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
        </svg>
      </button>

      {/* ── Backdrop (mobile only, when open) ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 flex-col transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#1a1a19", borderRight: "1px solid #2d2d2a" }}
      >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid #2d2d2a" }}>
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}
        >
          N
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">{t.teamName}</p>
          <p className="text-[10px] leading-tight mt-0.5" style={{ color: "#5a5a54" }}>
            NRP · AI Workspace
          </p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#4a4a44" }}>
          Menu
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150"
              style={
                active
                  ? {
                      background: `linear-gradient(135deg, rgba(201,100,66,0.18), rgba(201,100,66,0.08))`,
                      color: CLAUDE_ORANGE,
                      border: `1px solid rgba(201,100,66,0.2)`,
                    }
                  : {
                      color: "#6b6b65",
                      border: "1px solid transparent",
                    }
              }
            >
              <span style={active ? { color: CLAUDE_ORANGE } : { color: "#4a4a44" }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span
                  className="ml-auto size-1.5 rounded-full"
                  style={{ backgroundColor: CLAUDE_ORANGE }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Public Page link ── */}
      <div className="px-3 pb-3">
        <a
          href="/hire"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all hover:opacity-80"
          style={{ background: "rgba(201,100,66,0.1)", border: "1px solid rgba(201,100,66,0.2)" }}
        >
          <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: CLAUDE_ORANGE }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <div className="min-w-0">
            <p className="text-xs font-semibold" style={{ color: CLAUDE_ORANGE }}>Public Page</p>
            <p className="text-[10px]" style={{ color: "#7a5a4a" }}>/hire · สำหรับ client</p>
          </div>
        </a>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid #2d2d2a" }}>
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(45,158,107,0.08)", border: "1px solid rgba(74,222,128,0.15)" }}>
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium" style={{ color: "#4ade80" }}>{t.systemOnline}</p>
            <p className="text-[10px]" style={{ color: "#3a5a4a" }}>All agents ready</p>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
