import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { GoalPlan, Milestone } from "../types/goal";

export interface GoalStoreState {
  plan: GoalPlan | null;
  goalHealth: number;
  setGoalPlan: (plan: GoalPlan) => void;
  updateProgress: (taskId: string) => void;
  reOptimizeRemainingPath: () => Promise<void>;
  resetPlan: () => void;
}

const STORAGE_NAME = "goal-architect-store";

const computeGoalHealth = (milestones: Milestone[]) => {
  if (!milestones.length) {
    return 0;
  }
  const completed = milestones.filter(
    (milestone) => milestone.status === "completed"
  ).length;
  return Math.round((completed / milestones.length) * 100);
};

const normalizeMilestone = (milestone: Milestone): Milestone => ({
  ...milestone,
  estimatedHours: Number.isFinite(milestone.estimatedHours)
    ? milestone.estimatedHours
    : Math.round((milestone.estimatedMinutes / 60) * 10) / 10,
  difficulty: milestone.difficulty ?? "Medium",
  deliverable: milestone.deliverable ?? "",
  steps: Array.isArray(milestone.steps) ? milestone.steps : [],
  tips: Array.isArray(milestone.tips) ? milestone.tips : [],
  resources: Array.isArray(milestone.resources) ? milestone.resources : [],
});

const normalizePlanDates = (plan: GoalPlan): GoalPlan => ({
  ...plan,
  timeframe: {
    start: new Date(plan.timeframe.start),
    end: new Date(plan.timeframe.end),
  },
  milestones: plan.milestones.map((milestone) =>
    normalizeMilestone(milestone)
  ),
});

const storage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return undefined as unknown as Storage;
  }
  return window.localStorage;
});

export const useGoalStore = create<GoalStoreState>()(
  persist(
    (set, get) => ({
      plan: null,
      goalHealth: 0,
      setGoalPlan: (plan) => {
        const normalized = normalizePlanDates(plan);
        set({
          plan: normalized,
          goalHealth: computeGoalHealth(normalized.milestones),
        });
      },
      updateProgress: (taskId) => {
        const plan = get().plan;
        if (!plan) {
          return;
        }

        const updatedMilestones = plan.milestones.map((milestone) =>
          milestone.id === taskId
            ? {
                ...milestone,
                status:
                  milestone.status === "completed" ? "pending" : "completed",
              }
            : milestone
        );

        set({
          plan: { ...plan, milestones: updatedMilestones },
          goalHealth: computeGoalHealth(updatedMilestones),
        });
      },
      reOptimizeRemainingPath: async () => {
        const plan = get().plan;
        if (!plan) {
          return;
        }

        const remaining = plan.milestones.filter(
          (milestone) => milestone.status !== "completed"
        );

        const response = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalTitle: plan.goalTitle,
            timeframe: {
              start: plan.timeframe.start.toISOString(),
              end: plan.timeframe.end.toISOString(),
            },
            intensity: plan.intensity,
            remainingMilestones: remaining,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to re-optimize plan.");
        }

        const payload = (await response.json()) as { milestones: Milestone[] };
        const completed = plan.milestones.filter(
          (milestone) => milestone.status === "completed"
        );
        const nextMilestones = [...completed, ...payload.milestones];

        set({
          plan: {
            ...plan,
            milestones: nextMilestones,
          },
          goalHealth: computeGoalHealth(nextMilestones),
        });
      },
      resetPlan: () => {
        set({ plan: null, goalHealth: 0 });
      },
    }),
    {
      name: STORAGE_NAME,
      storage,
      partialize: (state) => ({ plan: state.plan }),
      onRehydrateStorage: () => (state) => {
        if (state?.plan) {
          const normalized = normalizePlanDates(state.plan);
          state.plan = normalized;
          state.goalHealth = computeGoalHealth(normalized.milestones);
        }
      },
    }
  )
);
