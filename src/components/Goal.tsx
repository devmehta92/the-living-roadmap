"use client";

import { useGoalStore } from "@/lib/store/goalStore";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Card } from "./Card";

export const Goal = () => {
  const goalHealth = useGoalStore((state) => state.goalHealth);
  const plan = useGoalStore((state) => state.plan);
  const updateProgress = useGoalStore((state) => state.updateProgress);
  const reOptimizeRemainingPath = useGoalStore(
    (state) => state.reOptimizeRemainingPath
  );
  const resetPlan = useGoalStore((state) => state.resetPlan);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const pendingMilestones =
    plan?.milestones.filter((milestone) => milestone.status !== "completed") ??
    [];
  const completedMilestones =
    plan?.milestones.filter((milestone) => milestone.status === "completed") ??
    [];
  const progressDial = useMemo(() => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (goalHealth / 100) * circumference;
    return { radius, circumference, offset };
  }, [goalHealth]);

  const handleLifeHappened = async () => {
    setOptimizing(true);
    setErrorMessage(null);
    try {
      await reOptimizeRemainingPath();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to reshuffle path."
      );
    } finally {
      setOptimizing(false);
    }
  };

  if (!plan) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800">
              {plan?.goalTitle ?? "No plan yet"}
            </h2>
            <p className="text-sm text-neutral-500">
              {plan
                ? `${plan.timeframe.start.toDateString()} · ${plan.timeframe.end.toDateString()} · ${plan.intensity}`
                : "Generate a plan to see milestones"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <button className="rounded-lg border border-neutral-200 bg-white px-4 py-2 transition-all duration-300 hover:shadow-md hover:border-primary-light">
              Export
            </button>
            <button
              type="button"
              onClick={resetPlan}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 transition-all duration-300 hover:shadow-md hover:border-primary-light"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <motion.div
            className="flex min-w-0 flex-col gap-4"
            layout
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {pendingMilestones.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 p-8 text-center text-base text-neutral-500">
                No plan yet... generate one to begin.
              </div>
            )}
            {pendingMilestones.map((milestone) => (
              <motion.button
                key={milestone.id}
                type="button"
                onClick={() => updateProgress(milestone.id)}
                className="flex w-full min-w-0 items-start justify-between gap-4 rounded-2xl border border-white/80 bg-white/90 p-5 text-left shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary-light"
                layout
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {milestone.category[0]}
                    </span>
                    <div>
                      <p className="break-words text-base font-semibold text-neutral-800">
                        {milestone.title}
                      </p>
                      <p className="break-words text-sm text-neutral-500">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-neutral-500">
                    <span className="rounded-full bg-neutral-100 px-3 py-1">
                      {milestone.estimatedMinutes} min
                    </span>
                    <span className="rounded-full bg-neutral-100 px-3 py-1">
                      {milestone.difficulty}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-3 py-1 break-words">
                      {milestone.deliverable}
                    </span>
                  </div>
                </div>
                <span className="mt-1 text-2xl text-neutral-300">›</span>
              </motion.button>
            ))}
          </motion.div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-white/80 bg-white/90 p-5 text-base text-neutral-600 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary-light">
              <h3 className="text-base font-semibold text-neutral-700">
                Goal Health
              </h3>
              <div className="mt-5 flex items-center justify-center">
                <svg width={140} height={140}>
                  <circle
                    cx="70"
                    cy="70"
                    r={progressDial.radius}
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r={progressDial.radius}
                    stroke="#4F46E5"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={progressDial.circumference}
                    strokeDashoffset={progressDial.offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.4s" }}
                  />
                  <text
                    x="70"
                    y="78"
                    textAnchor="middle"
                    className="fill-neutral-700 text-2xl font-semibold"
                  >
                    {goalHealth}%
                  </text>
                </svg>
              </div>
              <div className="mt-4 space-y-3 text-sm text-neutral-500">
                <div className="flex items-center justify-between">
                  <span>Milestones</span>
                  <span>{plan?.milestones.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed</span>
                  <span>{completedMilestones.length}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLifeHappened}
                disabled={optimizing}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-light hover:shadow-xl disabled:cursor-not-allowed disabled:bg-primary/60"
              >
                {optimizing ? "Re-optimizing..." : "Life Happened"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {pendingMilestones.slice(0, 3).map((milestone) => (
            <Card
              key={`${milestone.id}-detail`}
              milestone={milestone}
              previewLimit={3}
            />
          ))}
        </div>
        <div className="mt-8">
          <h3 className="text-base font-semibold text-neutral-700">
            Completed
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {completedMilestones.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 p-4 text-sm text-neutral-500">
                Complete a milestone to see it here.
              </div>
            )}
            {completedMilestones.map((milestone) => (
              <motion.div
                key={milestone.id}
                className="rounded-xl border border-neutral-100 bg-white px-5 py-3 text-sm text-neutral-400"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 140 }}
                layout
              >
                <div className="flex items-center justify-between">
                  <span className="line-through">{milestone.title}</span>
                  <span>{milestone.estimatedMinutes} min</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};