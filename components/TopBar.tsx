"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

const CLAUDE_ORANGE = "#c96442";

const PAGE_TITLES: Record<string, string> = {
  "/":          "Dashboard",
  "/hq":        "NRP HQ",
  "/goals":     "Goals",
  "/freelance": "Freelance",
};

interface TopBarProps {
  children?: React.ReactNode;
}

export default function TopBar({ children }: TopBarProps) {
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3"
      style={{
        backgroundColor: "rgba(249,247,244,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ede9e3",
      }}
    >
      {/* Left: page title + optional slot */}
      <div className="flex items-center gap-4 min-w-0">
        <h1 className="text-base font-bold text-slate-800 shrink-0">{title}</h1>
        {children && <div className="min-w-0">{children}</div>}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Date */}
        <span className="hidden md:block text-xs font-medium" style={{ color: "#9a9a94" }}>
          {new Date().toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
            weekday: "short", month: "short", day: "numeric",
          })}
        </span>

        {/* Lang toggle */}
        <div
          className="flex rounded-lg overflow-hidden text-xs font-semibold"
          style={{ border: "1px solid #e0dbd4" }}
        >
          {(["en", "th"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-2.5 py-1.5 transition-colors uppercase"
              style={
                lang === l
                  ? { background: CLAUDE_ORANGE, color: "#fff" }
                  : { background: "transparent", color: "#94a3b8" }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: "#f0ece6",
            color: "#9a9a94",
            border: "1px solid #e0dbd4",
          }}
          title="ออกจากระบบ"
        >
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">ออก</span>
        </button>
      </div>
    </header>
  );
}
