export type GoalIntensity = "Casual" | "Standard" | "Intense";

export type MilestoneCategory = "Study" | "Practice" | "Rest" | "Review";

export type MilestoneStatus = "pending" | "completed";

export type MilestoneDifficulty = "Easy" | "Medium" | "Hard";

export interface MilestoneResource {
  title: string;
  url: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  estimatedMinutes: number;
  estimatedHours: number;
  difficulty: MilestoneDifficulty;
  deliverable: string;
  steps: string[];
  tips: string[];
  resources: MilestoneResource[];
}

export interface GoalTimeframe {
  start: Date;
  end: Date;
}

export interface GoalPlan {
  goalTitle: string;
  timeframe: GoalTimeframe;
  intensity: GoalIntensity;
  milestones: Milestone[];
}

export interface GoalPlanRequest {
  goalTitle: string;
  timeframe: GoalTimeframe;
  intensity: GoalIntensity;
}

export interface GoalPlanResponse {
  milestones: Milestone[];
  summary: string;
}
