"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useGoalStore } from "@/lib/store/goalStore";
import type {
  GoalIntensity,
  GoalPlanResponse,
  MilestoneCategory,
} from "@/lib/types/goal";

const intensityOptions: GoalIntensity[] = ["Casual", "Standard", "Intense"];
const categories: MilestoneCategory[] = [
  "Study",
  "Practice",
  "Rest",
  "Review",
];

const makeCardImage = (primary: string, secondary: string, accent: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}"/>
          <stop offset="100%" stop-color="${secondary}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="180" rx="28" fill="url(#g)"/>
      <circle cx="70" cy="120" r="38" fill="${accent}" opacity="0.35"/>
      <circle cx="150" cy="70" r="46" fill="${accent}" opacity="0.25"/>
      <rect x="190" y="60" width="90" height="60" rx="18" fill="${accent}" opacity="0.3"/>
    </svg>`
  )}`;

const templateCards = [
  {
    title: "Fitness",
    description: "Build a consistent routine.",
    image: makeCardImage("#E1F8EF", "#E0F2FE", "#A7F3D0"),
  },
  {
    title: "Career",
    description: "Grow into your next role.",
    image: makeCardImage("#E6E6FA", "#FDF5E6", "#C7D2FE"),
  },
  {
    title: "Learning",
    description: "Master a new skill.",
    image: makeCardImage("#E0F2FE", "#FDF5E6", "#FBCFE8"),
  },
];

export default function GoalArchitectPage() {
  const setGoalPlan = useGoalStore((state) => state.setGoalPlan);
  const goalHealth = useGoalStore((state) => state.goalHealth);
  const plan = useGoalStore((state) => state.plan);
  const updateProgress = useGoalStore((state) => state.updateProgress);
  const reOptimizeRemainingPath = useGoalStore(
    (state) => state.reOptimizeRemainingPath
  );
  const resetPlan = useGoalStore((state) => state.resetPlan);

  const [goalTitle, setGoalTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [intensity, setIntensity] = useState<GoalIntensity>("Standard");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [summary, setSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const pendingMilestones =
    plan?.milestones.filter((milestone) => milestone.status !== "completed") ??
    [];
  const completedMilestones =
    plan?.milestones.filter((milestone) => milestone.status === "completed") ??
    [];
  const milestonesByCategory = plan?.milestones.reduce(
    (acc, milestone) => {
      acc[milestone.category] = acc[milestone.category] ?? [];
      acc[milestone.category].push(milestone);
      return acc;
    },
    {} as Record<MilestoneCategory, typeof pendingMilestones>
  );
  const previewLimit = 3;

  const progressDial = useMemo(() => {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (goalHealth / 100) * circumference;
    return { radius, circumference, offset };
  }, [goalHealth]);

  const handleGenerate = async () => {
    if (!goalTitle || !startDate || !endDate) {
      return;
    }

    setStatus("loading");
    setSummary(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalTitle,
          timeframe: {
            start: startDate,
            end: endDate,
          },
          intensity,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        const message = payload?.error ?? "Failed to generate plan.";
        throw new Error(message);
      }

      const payload = (await response.json()) as GoalPlanResponse;

      setGoalPlan({
        goalTitle,
        timeframe: {
          start: new Date(startDate),
          end: new Date(endDate),
        },
        intensity,
        milestones: payload.milestones,
      });

      setSummary(payload.summary);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate plan."
      );
      setStatus("error");
    }
  };

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_55%),radial-gradient(circle_at_left,#e1f8ef,transparent_55%),radial-gradient(circle_at_bottom,#fdf5e6,transparent_50%),radial-gradient(circle_at_right,#e6e6fa,transparent_50%)] px-6 py-10">
      <motion.div
        className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_1fr]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <section className="flex min-w-0 flex-col gap-6">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-semibold text-slate-800">
                  Goal Roadmap
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Turn a goal into a plan you can actually follow.
                </p>
                <p className="text-sm text-slate-500">
                  Goal Roadmap builds focused paths with clear milestones,
                  resources, and review cycles.
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Goal
                    <input
                      value={goalTitle}
                      onChange={(event) => setGoalTitle(event.target.value)}
                      placeholder="Pass the SATs with a 1450+"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </label>
                  <div className="rounded-2xl border border-white/70 bg-slate-50/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Sample prompts
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        {
                          label: "Education",
                          badge: "ED",
                          items: [
                            "Pass the SATs with a 1450+",
                            "Learn product design fundamentals",
                          ],
                          badgeClass: "bg-indigo-100 text-indigo-600",
                        },
                        {
                          label: "Fitness",
                          badge: "FT",
                          items: [
                            "Train for a half marathon",
                            "Build a 30-day mobility plan",
                          ],
                          badgeClass: "bg-emerald-100 text-emerald-600",
                        },
                        {
                          label: "Career",
                          badge: "CR",
                          items: [
                            "Launch a personal finance tracker",
                            "Prepare for a product manager role",
                          ],
                          badgeClass: "bg-amber-100 text-amber-700",
                        },
                        {
                          label: "Lifestyle",
                          badge: "LS",
                          items: [
                            "Reset sleep schedule in 4 weeks",
                            "Plan a weekly meal-prep system",
                          ],
                          badgeClass: "bg-rose-100 text-rose-600",
                        },
                      ].map((group) => (
                        <div
                          key={group.label}
                          className="rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-xl text-[10px] ${group.badgeClass}`}
                            >
                              {group.badge}
                            </span>
                            {group.label}
                          </div>
                          <div className="mt-2 flex flex-col gap-2">
                            {group.items.map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                onClick={() => setGoalTitle(prompt)}
                                className="rounded-2xl border border-white/80 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-slate-800"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold uppercase text-slate-400">
                      Start date
                      <input
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase text-slate-400">
                      End date
                      <input
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {intensityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setIntensity(option)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          intensity === option
                            ? "bg-indigo-500 text-white"
                            : "bg-white text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={status === "loading"}
                    className="mt-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {status === "loading" ? "Generating..." : "Generate Plan"}
                  </button>
                  {status === "error" && (
                    <p className="text-xs text-rose-600">
                      {errorMessage ??
                        "Something went wrong. Check your API key and try again."}
                    </p>
                  )}
                  {summary && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs text-slate-600">
                      {summary}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {templateCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-slate-600 shadow-sm backdrop-blur"
              >
                <img
                  src={card.image}
                  alt={`${card.title} preview`}
                  className="h-24 w-full rounded-xl object-cover"
                />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {card.title}
                </p>
                <p className="text-xs text-slate-500">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-6">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {plan?.goalTitle ?? "No plan yet"}
                </h2>
                <p className="text-xs text-slate-500">
                  {plan
                    ? `${plan.timeframe.start.toDateString()} · ${plan.timeframe.end.toDateString()} · ${plan.intensity}`
                    : "Generate a plan to see milestones"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-1">
                  Export
                </button>
                <button
                  type="button"
                  onClick={resetPlan}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <motion.div
                className="flex min-w-0 flex-col gap-3"
                layout
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
              >
                {pendingMilestones.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
                    No plan yet... generate one to begin.
                  </div>
                )}
                {pendingMilestones.map((milestone) => (
                  <motion.button
                    key={milestone.id}
                    type="button"
                    onClick={() => updateProgress(milestone.id)}
                    className="flex w-full min-w-0 items-start justify-between gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-left shadow-sm transition hover:shadow-md"
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-semibold text-indigo-600">
                          {milestone.category[0]}
                        </span>
                        <div>
                          <p className="break-words text-sm font-semibold text-slate-800">
                            {milestone.title}
                          </p>
                          <p className="break-words text-xs text-slate-500">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {milestone.estimatedMinutes} min
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1">
                          {milestone.difficulty}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 break-words">
                          {milestone.deliverable}
                        </span>
                      </div>
                    </div>
                    <span className="mt-1 text-xl text-slate-300">›</span>
                  </motion.button>
                ))}
              </motion.div>

              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Goal Health
                  </h3>
                  <div className="mt-4 flex items-center justify-center">
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
                        stroke="#6366f1"
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
                        className="fill-slate-700 text-xl font-semibold"
                      >
                        {goalHealth}%
                      </text>
                    </svg>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-slate-500">
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
                    className="mt-4 w-full rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
                  >
                    {optimizing ? "Re-optimizing..." : "Life Happened"}
                  </button>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-xs text-slate-500 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Focus Areas
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {categories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <span>{category}</span>
                        <span>{milestonesByCategory?.[category]?.length ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {plan && (
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Detailed Breakdown
                  </h3>
                  <div className="mt-3 grid gap-3">
                    {pendingMilestones.slice(0, 3).map((milestone) => (
                      <div
                        key={`${milestone.id}-detail`}
                        className="min-w-0 rounded-2xl border border-slate-100 bg-white px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="break-words text-sm font-semibold text-slate-800">
                            {milestone.title}
                          </p>
                          <span className="text-xs text-slate-400">
                            {milestone.estimatedHours} hr
                          </span>
                        </div>
                        <p className="mt-1 break-words text-xs text-slate-500">
                          {milestone.description}
                        </p>
                        <div className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                          <div>
                            <p className="font-semibold text-slate-400">Steps</p>
                            <ul className="mt-1 space-y-1">
                              {milestone.steps
                                .slice(0, previewLimit)
                                .map((step) => (
                                  <li key={step} className="flex gap-2 break-words">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300" />
                                    <span>{step}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-400">Tips</p>
                            <ul className="mt-1 space-y-1">
                              {milestone.tips
                                .slice(0, previewLimit)
                                .map((tip) => (
                                  <li key={tip} className="flex gap-2 break-words">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                    <span>{tip}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-slate-600">
                          <p className="font-semibold text-slate-400">Resources</p>
                          <div className="mt-1 flex flex-col gap-1">
                            {milestone.resources
                              .slice(0, previewLimit)
                              .map((resource) => (
                                <a
                                  key={`${milestone.id}-${resource.title}`}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="break-words text-indigo-500 underline-offset-2 hover:underline"
                                >
                                  {resource.title}
                                </a>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Completed
                  </h3>
                  <div className="mt-3 flex flex-col gap-2">
                    {completedMilestones.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-3 text-xs text-slate-500">
                        Complete a milestone to see it here.
                      </div>
                    )}
                    {completedMilestones.map((milestone) => (
                      <motion.div
                        key={milestone.id}
                        className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-xs text-slate-400"
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
            )}
          </div>
        </section>
      </motion.div>
    </main>
  );
}
