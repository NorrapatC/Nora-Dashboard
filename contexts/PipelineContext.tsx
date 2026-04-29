"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import {
  PipelineState,
  PipelineStageState,
  StageStatus,
  PIPELINE_STAGES,
  buildInitialPipelineState,
  buildStateMap,
  resolveEffectiveStatus,
  canTransition,
} from "@/lib/pipeline";

const STORAGE_KEY = "nora_pipeline_v1";

// ─── Context shape ──────────────────────────────────────────────────────────

interface PipelineContextValue {
  pipeline: PipelineState;

  // Read
  getStageState: (stageId: string) => PipelineStageState;
  getEffectiveStatus: (stageId: string) => StageStatus;
  canAdvance: (stageId: string) => boolean;
  progress: { total: number; completed: number; inProgress: number; blocked: number; pct: number };

  // Write
  setStageStatus: (stageId: string, status: StageStatus, note?: string) => void;
  resetPipeline: () => void;
  setProjectName: (name: string) => void;
}

const PipelineContext = createContext<PipelineContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [pipeline, setPipeline] = useState<PipelineState>(() => {
    if (typeof window === "undefined") return buildInitialPipelineState();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as PipelineState;
    } catch {}
    return buildInitialPipelineState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pipeline));
    } catch {}
  }, [pipeline]);

  const stateMap = useMemo(() => buildStateMap(pipeline.stages), [pipeline.stages]);

  const getStageState = useCallback(
    (stageId: string): PipelineStageState =>
      pipeline.stages.find((s) => s.stageId === stageId) ?? {
        stageId,
        status: "idle",
        startedAt: null,
        completedAt: null,
        note: null,
      },
    [pipeline.stages]
  );

  const getEffectiveStatus = useCallback(
    (stageId: string): StageStatus => {
      const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
      if (!stage) return "idle";
      return resolveEffectiveStatus(stage, stateMap);
    },
    [stateMap]
  );

  const canAdvance = useCallback(
    (stageId: string): boolean => {
      const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
      if (!stage) return false;
      const currentStatus = stateMap.get(stageId) ?? "idle";
      if (currentStatus === "completed") return false;
      const next: StageStatus = currentStatus === "idle" ? "in_progress" : "completed";
      return canTransition(stage, next, stateMap).allowed;
    },
    [stateMap]
  );

  const setStageStatus = useCallback(
    (stageId: string, status: StageStatus, note?: string) => {
      const now = new Date().toISOString();
      setPipeline((prev) => ({
        ...prev,
        lastUpdated: now,
        stages: prev.stages.map((s) => {
          if (s.stageId !== stageId) return s;
          return {
            ...s,
            status,
            note: note ?? s.note,
            startedAt: status === "in_progress" && !s.startedAt ? now : s.startedAt,
            completedAt: status === "completed" ? now : s.completedAt,
          };
        }),
      }));
    },
    []
  );

  const resetPipeline = useCallback(() => {
    setPipeline(buildInitialPipelineState(pipeline.projectName));
  }, [pipeline.projectName]);

  const setProjectName = useCallback((name: string) => {
    setPipeline((prev) => ({ ...prev, projectName: name, lastUpdated: new Date().toISOString() }));
  }, []);

  const progress = useMemo(() => {
    const effectiveStatuses = PIPELINE_STAGES.map((s) =>
      resolveEffectiveStatus(s, stateMap)
    );
    const completed = effectiveStatuses.filter((s) => s === "completed").length;
    const inProgress = effectiveStatuses.filter((s) => s === "in_progress").length;
    const blocked = effectiveStatuses.filter((s) => s === "blocked").length;
    const total = PIPELINE_STAGES.length;
    return { total, completed, inProgress, blocked, pct: Math.round((completed / total) * 100) };
  }, [stateMap]);

  return (
    <PipelineContext.Provider
      value={{
        pipeline,
        getStageState,
        getEffectiveStatus,
        canAdvance,
        progress,
        setStageStatus,
        resetPipeline,
        setProjectName,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePipeline(): PipelineContextValue {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error("usePipeline must be used inside <PipelineProvider>");
  return ctx;
}
