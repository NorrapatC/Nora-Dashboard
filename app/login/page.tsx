"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ORANGE = "#c96442";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const inputRef     = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [dots,     setDots]     = useState(0);

  // Animate dots in loading state
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = searchParams.get("from") ?? "/";
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "รหัสผ่านไม่ถูกต้อง");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ — ลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#f9f7f4" }}>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: `radial-gradient(circle, ${ORANGE}, transparent 70%)` }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex size-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg mb-4"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}
          >
            N
          </div>
          <h1 className="text-xl font-bold text-slate-800">Nora System</h1>
          <p className="text-sm text-slate-400 mt-1">AI Secretary · Developer Workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden"
          style={{ border: "1px solid #ede9e3" }}>

          {/* Dark header */}
          <div className="px-6 py-5" style={{ backgroundColor: "#1a1a19" }}>
            <p className="text-sm font-semibold text-white">เข้าสู่ระบบ</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#6b6b65" }}>
              กรอกรหัสผ่านเพื่อเข้าใช้งาน Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none transition"
                  style={{
                    borderColor: error ? "#fca5a5" : "#e8e4df",
                    boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.08)" : undefined,
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-2"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <svg className="size-3 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-xs text-red-500 font-medium">{error}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? "#94a3b8" : ORANGE }}
            >
              {loading ? `กำลังเข้าสู่ระบบ${".".repeat(dots)}` : "เข้าสู่ระบบ"}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-5">
            <div className="flex items-center justify-center gap-1.5 rounded-xl py-2"
              style={{ background: "#f9f7f4", border: "1px solid #f0ece6" }}>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400">System Online</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-300 mt-6">
          Nora AI System · Internal Use Only
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
