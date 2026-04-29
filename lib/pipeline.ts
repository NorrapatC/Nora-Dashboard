// ─── Core Types ────────────────────────────────────────────────────────────

export type StageStatus = "idle" | "in_progress" | "completed" | "blocked";

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string; // hex
}

export interface PipelineStage {
  id: string;
  agent: Agent;
  label: string;
  description: string;
  dependsOn: string[]; // stage IDs that must be completed first
}

export interface PipelineStageState {
  stageId: string;
  status: StageStatus;
  startedAt: string | null;
  completedAt: string | null;
  note: string | null;
}

export interface PipelineState {
  id: string; // pipeline run ID
  projectName: string;
  stages: PipelineStageState[];
  createdAt: string;
  lastUpdated: string;
}

// ─── Derived helpers ────────────────────────────────────────────────────────

export function buildStateMap(states: PipelineStageState[]): Map<string, StageStatus> {
  return new Map(states.map((s) => [s.stageId, s.status]));
}

export function resolveEffectiveStatus(
  stage: PipelineStage,
  stateMap: Map<string, StageStatus>
): StageStatus {
  const stored = stateMap.get(stage.id) ?? "idle";
  if (stored === "completed") return "completed";
  if (stored === "blocked") return "blocked";
  const depsComplete = stage.dependsOn.every(
    (dep) => stateMap.get(dep) === "completed"
  );
  if (!depsComplete && stored === "in_progress") return "blocked";
  return stored;
}

export function canTransition(
  stage: PipelineStage,
  next: StageStatus,
  stateMap: Map<string, StageStatus>
): { allowed: boolean; reason?: string } {
  if (next === "in_progress") {
    const blocking = stage.dependsOn.filter(
      (dep) => stateMap.get(dep) !== "completed"
    );
    if (blocking.length > 0) {
      return { allowed: false, reason: `Waiting on: ${blocking.join(", ")}` };
    }
  }
  return { allowed: true };
}

// Returns topological waves for layout (parallel stages share a wave index)
export function toWaves(stages: PipelineStage[]): PipelineStage[][] {
  const depthMap = new Map<string, number>();

  function depth(id: string): number {
    if (depthMap.has(id)) return depthMap.get(id)!;
    const stage = stages.find((s) => s.id === id);
    if (!stage || stage.dependsOn.length === 0) {
      depthMap.set(id, 0);
      return 0;
    }
    const d = Math.max(...stage.dependsOn.map(depth)) + 1;
    depthMap.set(id, d);
    return d;
  }

  stages.forEach((s) => depth(s.id));

  const maxDepth = Math.max(...Array.from(depthMap.values()));
  const waves: PipelineStage[][] = Array.from({ length: maxDepth + 1 }, () => []);
  stages.forEach((s) => waves[depthMap.get(s.id)!].push(s));
  return waves;
}

// ─── Pipeline Definition ────────────────────────────────────────────────────

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "nora",
    agent: { id: "nora", name: "Nora", role: "Secretary", emoji: "📋", color: "#c96442" },
    label: "Receive & Plan",
    description: "Clarify requirement, break into tasks, assign team",
    dependsOn: [],
  },
  {
    id: "aria",
    agent: { id: "aria", name: "Aria", role: "Tech Lead", emoji: "🏗️", color: "#6366f1" },
    label: "Architecture",
    description: "System design, stack decision, ADR",
    dependsOn: ["nora"],
  },
  {
    id: "nova",
    agent: { id: "nova", name: "Nova", role: "UI/UX Designer", emoji: "🎨", color: "#ec4899" },
    label: "UI/UX Design",
    description: "Wireframes, component spec, user flow",
    dependsOn: ["aria"],
  },
  {
    id: "sage",
    agent: { id: "sage", name: "Sage", role: "Database Engineer", emoji: "🗄️", color: "#0ea5e9" },
    label: "Database Design",
    description: "Schema, migrations, query patterns",
    dependsOn: ["aria"],
  },
  {
    id: "mia",
    agent: { id: "mia", name: "Mia", role: "Frontend Dev", emoji: "💻", color: "#8b5cf6" },
    label: "Frontend Build",
    description: "UI implementation, components, client logic",
    dependsOn: ["nova", "sage"],
  },
  {
    id: "luna",
    agent: { id: "luna", name: "Luna", role: "Backend Dev", emoji: "⚙️", color: "#10b981" },
    label: "Backend Build",
    description: "API routes, business logic, integrations",
    dependsOn: ["nova", "sage"],
  },
  {
    id: "vera",
    agent: { id: "vera", name: "Vera", role: "Security Engineer", emoji: "🔐", color: "#ef4444" },
    label: "Security Review",
    description: "Vulnerability check, auth hardening, OWASP review",
    dependsOn: ["mia", "luna"],
  },
  {
    id: "iris",
    agent: { id: "iris", name: "Iris", role: "Code Reviewer", emoji: "👁️", color: "#f59e0b" },
    label: "Code Review",
    description: "Code quality, patterns, standards enforcement",
    dependsOn: ["mia", "luna"],
  },
  {
    id: "zoe",
    agent: { id: "zoe", name: "Zoe", role: "QA Engineer", emoji: "🧪", color: "#06b6d4" },
    label: "QA & Testing",
    description: "Test cases, edge cases, regression, sign-off",
    dependsOn: ["vera", "iris"],
  },
  {
    id: "rex",
    agent: { id: "rex", name: "Rex", role: "DevOps Engineer", emoji: "🚀", color: "#64748b" },
    label: "Deploy",
    description: "CI/CD pipeline, infrastructure, monitoring setup",
    dependsOn: ["zoe"],
  },
  {
    id: "lyra",
    agent: { id: "lyra", name: "Lyra", role: "Technical Writer", emoji: "✍️", color: "#84cc16" },
    label: "Documentation",
    description: "README, API docs, changelog, user guide",
    dependsOn: ["rex"],
  },
];

export function buildInitialPipelineState(projectName = ""): PipelineState {
  return {
    id: crypto.randomUUID(),
    projectName,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    stages: PIPELINE_STAGES.map((s) => ({
      stageId: s.id,
      status: "idle",
      startedAt: null,
      completedAt: null,
      note: null,
    })),
  };
}
