"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { type NSettings, SETTINGS_KEY, DEFAULT_SETTINGS as DEFAULT, loadSettings } from "@/lib/settings";

const ORANGE = "#c96442";

function getAllLocalStorageData() {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    try { data[key] = JSON.parse(localStorage.getItem(key) ?? "null"); }
    catch { data[key] = localStorage.getItem(key); }
  }
  return data;
}

export default function SettingsPage() {
  const [form, setForm] = useState<NSettings>(DEFAULT);
  const [saved, setSaved] = useState(false);
  const [exported, setExported] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "freelance" | "data">("profile");
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  useEffect(() => {
    setForm(loadSettings());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeTab !== "data" || !mounted) return;
    refreshStorageKeys();
  }, [activeTab, mounted]);

  function refreshStorageKeys() {
    setStorageKeys(
      Object.keys(localStorage).filter((k) => k.startsWith("nora_")).sort()
    );
  }

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function exportData() {
    const data = getAllLocalStorageData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([k, v]) => {
          localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        });
        setForm(loadSettings());
        alert("Import สำเร็จค่ะ — รีเฟรชหน้าเพื่อเห็นข้อมูลที่ import");
      } catch { alert("ไฟล์ไม่ถูกต้องค่ะ"); }
    };
    reader.readAsText(file);
  }

  function clearKey(key: string) {
    if (!confirm(`ลบ "${key}" ออกจาก storage จริงไหมคะ?`)) return;
    localStorage.removeItem(key);
    refreshStorageKeys();
  }

  const set = (k: keyof NSettings, v: NSettings[keyof NSettings]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const TABS = [
    { key: "profile",   label: "👤 Profile" },
    { key: "freelance", label: "💼 Freelance" },
    { key: "data",      label: "💾 Data" },
  ] as const;

  if (!mounted) return null;

  return (
    <>
      <TopBar />
      <main className="px-6 py-6 max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="text-xl font-black text-slate-900">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">ตั้งค่าทุกอย่างที่นี่ได้เลยนะคะ</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl p-1" style={{ background: "#f0ece6" }}>
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
              style={activeTab === tab.key
                ? { background: "#fff", color: ORANGE, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "#94a3b8" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-sm font-bold text-slate-700">Profile สำหรับ Public Page (/hire)</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">ชื่อ</label>
                <input value={form.profileName} onChange={(e) => set("profileName", e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none"
                  style={{ border: "1px solid #e2e8f0", background: "#fafafa" }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                <input value={form.profileEmail} onChange={(e) => set("profileEmail", e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none"
                  style={{ border: "1px solid #e2e8f0", background: "#fafafa" }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bio</label>
                <textarea value={form.profileBio} onChange={(e) => set("profileBio", e.target.value)}
                  rows={3} className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none resize-none"
                  style={{ border: "1px solid #e2e8f0", background: "#fafafa" }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Freelance Tab ── */}
        {activeTab === "freelance" && (
          <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4" style={{ border: "1px solid #ede9e3" }}>
            <p className="text-sm font-bold text-slate-700">Freelance Settings</p>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Monthly Target: <span className="font-bold text-slate-800">฿{form.monthlyTarget.toLocaleString("th-TH")}</span>
              </label>
              <input type="range" min={5000} max={200000} step={5000} value={form.monthlyTarget}
                onChange={(e) => set("monthlyTarget", Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: ORANGE }} />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>฿5,000</span><span>฿200,000</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Availability สำหรับ /hire</label>
              <div className="flex gap-3">
                {[true, false].map((v) => (
                  <button key={String(v)} onClick={() => set("availability", v)}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all"
                    style={form.availability === v
                      ? { background: v ? "#f0fdf4" : "#fef2f2", color: v ? "#16a34a" : "#ef4444", border: `1.5px solid ${v ? "#bbf7d0" : "#fecaca"}` }
                      : { background: "#f8fafc", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                    {v ? "✅ พร้อมรับงาน" : "🔴 ไม่ว่างชั่วคราว"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Data Tab ── */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
              <p className="text-sm font-bold text-slate-700 mb-4">Export / Import ข้อมูลทั้งหมด</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <button onClick={exportData}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
                  {exported ? "✓ Export แล้วค่ะ!" : "⬇️ Export JSON"}
                </button>
                <label className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold cursor-pointer transition-all hover:opacity-80"
                  style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                  ⬆️ Import JSON
                  <input type="file" accept=".json" className="hidden" onChange={importData} />
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-3">Export จะดาวน์โหลด JSON ของ localStorage ทั้งหมด — Goals, Clients, Pipeline, Feedback, Settings นะคะ</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid #ede9e3" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-700">Storage Keys</p>
                <button onClick={refreshStorageKeys}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  รีเฟรช
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {storageKeys.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มี data ค่ะ</p>
                ) : storageKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                    style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <span className="text-xs font-mono text-slate-600 truncate">{key}</span>
                    <button onClick={() => clearKey(key)}
                      className="text-xs text-red-400 hover:text-red-600 shrink-0 font-medium">ลบ</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        {activeTab !== "data" && (
          <button onClick={save}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${ORANGE}, #a04e32)` }}>
            {saved ? "✓ บันทึกแล้วค่ะ!" : "💾 บันทึก Settings"}
          </button>
        )}
      </main>
    </>
  );
}
