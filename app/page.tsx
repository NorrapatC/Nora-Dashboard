"use client";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePipeline } from "@/contexts/PipelineContext";
import { PIPELINE_STAGES } from "@/lib/pipeline";
import TopBar from "@/components/TopBar";
import NoraBriefing from "@/components/NoraBriefing";
import AgentCard from "@/components/AgentCard";
import RequirementsPanel from "@/components/RequirementsPanel";
import FeedbackPanel from "@/components/FeedbackPanel";
import PipelineBoard from "@/components/pipeline/PipelineBoard";
import TeamWorkflowPanel from "@/components/TeamWorkflowPanel";
import HQOfficeWidget from "@/components/HQOfficeWidget";
import ErrorBoundary from "@/components/ErrorBoundary";

const CLAUDE_ORANGE = "#c96442";

interface ProjectContext { name: string; desc: string; }

export default function Page() {
  const { t } = useLanguage();
  const { progress } = usePipeline();

  // ── Project (localStorage) ──────────────────────────────────────────────────
  const [project, setProject] = useState<ProjectContext>(() => {
    if (typeof window === "undefined") return { name: "", desc: "" };
    try { return JSON.parse(localStorage.getItem("nora_project") ?? '{"name":"","desc":""}'); } catch { return { name: "", desc: "" }; }
  });
  const [editingProject, setEditingProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState<ProjectContext>(project);

  useEffect(() => { localStorage.setItem("nora_project", JSON.stringify(project)); }, [project]);
  function saveProject() { setProject(projectDraft); setEditingProject(false); }

  // ── Req stats ──────────────────────────────────────────────────────────────
  const [reqStats, setReqStats] = useState({ done: 0, pending: 0 });
  const handleStatsChange = useCallback((done: number, pending: number) => {
    setReqStats({ done, pending });
  }, []);

  // ── Team workflow ───────────────────────────────────────────────────────────
  const [workflowTitle, setWorkflowTitle]         = useState<string | null>(null);
  const [workflowAssignedTo, setWorkflowAssignedTo] = useState<string | undefined>(undefined);
  const [workflowRunKey, setWorkflowRunKey]         = useState(0);
  const [dispatchInput, setDispatchInput]           = useState("");

  const handleWorkflowTrigger = useCallback((title: string, assignedTo?: string) => {
    setWorkflowTitle(title);
    setWorkflowAssignedTo(assignedTo);
    setWorkflowRunKey((k) => k + 1);
  }, []);

  function handleDispatch() {
    if (!dispatchInput.trim()) return;
    handleWorkflowTrigger(dispatchInput.trim());
    setDispatchInput("");
  }

  // ── Today's goals count ────────────────────────────────────────────────────
  const [todayGoalsDone, setTodayGoalsDone] = useState(0);
  const [todayGoalsTotal, setTodayGoalsTotal] = useState(0);
  useEffect(() => {
    try {
      const key = `nora_goals_${new Date().toISOString().slice(0, 10)}`;
      const goals = JSON.parse(localStorage.getItem(key) ?? "[]") as { done: boolean }[];
      setTodayGoalsTotal(goals.length);
      setTodayGoalsDone(goals.filter((g) => g.done).length);
    } catch { /* ignore */ }
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeCount = progress.inProgress;
  const idleCount   = progress.total - progress.inProgress - progress.completed - progress.blocked;

  // ── Project pill ───────────────────────────────────────────────────────────
  const projectPill = !editingProject ? (
    <button
      onClick={() => { setProjectDraft(project); setEditingProject(true); }}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors min-w-0 max-w-xs"
      style={{ background: "#f0ece6", border: "1px solid #e0dbd4" }}
    >
      <svg className="size-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: CLAUDE_ORANGE }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h12" />
      </svg>
      <span className="truncate text-slate-600">{project.name || t.projectNamePlaceholder}</span>
      <svg className="size-3 shrink-0 ml-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
      </svg>
    </button>
  ) : (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        className="rounded-lg px-3 py-1.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1"
        style={{ border: `1px solid ${CLAUDE_ORANGE}`, width: 200 }}
        placeholder={t.projectNamePlaceholder}
        value={projectDraft.name}
        onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && saveProject()}
      />
      <button onClick={saveProject}
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
        style={{ background: CLAUDE_ORANGE }}>
        {t.saveProject}
      </button>
    </div>
  );

  return (
    <>
      <TopBar>{projectPill}</TopBar>

      <main className="px-6 py-6 space-y-8">

        {/* ─── Nora Briefing (รวม Stats + Interview Countdown) ─── */}
        <ErrorBoundary label="Nora Briefing">
          <NoraBriefing
            activeCount={activeCount}
            doneCount={reqStats.done}
            pendingCount={reqStats.pending}
            idleCount={idleCount}
            pipelinePct={progress.pct}
            pipelineCompleted={progress.completed}
            pipelineTotal={progress.total}
          />
        </ErrorBoundary>

        {/* ─── Pipeline ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Development Pipeline</h2>
          <ErrorBoundary label="Pipeline">
            <PipelineBoard />
          </ErrorBoundary>
        </section>

        {/* ─── Team ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.teamMembers}</h2>
            <span className="text-xs text-slate-400">{PIPELINE_STAGES.length} {t.agents}</span>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {PIPELINE_STAGES.map((stage) => <AgentCard key={stage.id} stage={stage} />)}
          </div>
        </section>

        {/* ─── HQ Pixel Office (live) ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">HQ Office</h2>
          <ErrorBoundary label="HQ Office">
            <HQOfficeWidget />
          </ErrorBoundary>
        </section>

        {/* ─── Today's Goals quick link ─── */}
        <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3.5 shadow-sm"
          style={{ border: "1px solid #ede9e3" }}>
          <div className="flex items-center gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">วันนี้</p>
              <p className="text-xs text-slate-400">
                {todayGoalsTotal === 0
                  ? "ยังไม่มี goal — ไปเพิ่มได้เลย"
                  : `${todayGoalsDone}/${todayGoalsTotal} goals เสร็จแล้ว`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {todayGoalsTotal > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.round((todayGoalsDone / todayGoalsTotal) * 100)}%`, backgroundColor: "#c96442" }} />
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {Math.round((todayGoalsDone / todayGoalsTotal) * 100)}%
                </span>
              </div>
            )}
            <a href="/goals"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              style={{ background: "#fdf3ef", color: "#c96442", border: "1px solid #f5d6c8" }}>
              จัดการ Goals →
            </a>
          </div>
        </div>

        {/* ─── Nora Dispatch ─── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Ask Nora</h2>
          <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid #ede9e3" }}>
            {/* Input */}
            <div className="p-4 flex gap-3 items-start" style={{ borderBottom: "1px solid #f0ece6" }}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}>
                N
              </div>
              <div className="flex-1 min-w-0">
                <input
                  value={dispatchInput}
                  onChange={(e) => setDispatchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDispatch()}
                  placeholder="พิมพ์หัวข้อที่ต้องการให้ทีมวิเคราะห์... เช่น สร้าง login page, ออกแบบ database schema"
                  className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                onClick={handleDispatch}
                disabled={!dispatchInput.trim()}
                className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${CLAUDE_ORANGE}, #a04e32)` }}
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                ส่งให้ทีม
              </button>
            </div>

            {/* Team Workflow inline */}
            <div className="p-4">
              <TeamWorkflowPanel
                topic={workflowTitle}
                assignedTo={workflowAssignedTo}
                runKey={workflowRunKey}
              />
            </div>
          </div>
        </section>

        {/* ─── Requirements + Feedback ─── */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              {t.requirements}
              <span className="ml-2 normal-case font-normal text-slate-300">— คลิก row เพื่อส่งให้ทีมวิเคราะห์</span>
            </h2>
            <ErrorBoundary label="Requirements">
              <RequirementsPanel
                projectName={project.name}
                onStatsChange={handleStatsChange}
                onWorkflowTrigger={handleWorkflowTrigger}
              />
            </ErrorBoundary>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">{t.teamFeedback}</h2>
            <ErrorBoundary label="Feedback">
              <FeedbackPanel />
            </ErrorBoundary>
          </div>
        </div>

      </main>
    </>
  );
}
