"use client";

import { useState } from "react";
import { useGoalStore } from "@/lib/store/goalStore";
import type { GoalIntensity, GoalPlanResponse } from "@/lib/types/goal";

const intensityOptions: GoalIntensity[] = ["Casual", "Standard", "Intense"];

export const NewGoal = () => {
  const setGoalPlan = useGoalStore((state) => state.setGoalPlan);

  const [goalTitle, setGoalTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [intensity, setIntensity] = useState<GoalIntensity>("Standard");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [summary, setSummary] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      const payload = (await response.json()) as GoalPlanResponse;

      if (!response.ok) {
        const message =
          (payload as unknown as { error?: string })?.error ??
          "Failed to generate plan.";
        throw new Error(message);
      }

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

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Goal
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                This information will be used to generate a personalized goal
                plan for you.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-4">
                <label
                  htmlFor="goal"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Goal
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="goal"
                    id="goal"
                    value={goalTitle}
                    onChange={(event) => setGoalTitle(event.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Pass the SATs with a 1450+"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Start date
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  End date
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="intensity"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Intensity
                </label>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-3">
                    {intensityOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setIntensity(option)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                          intensity === option
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "bg-white text-neutral-500 hover:bg-neutral-50 hover:shadow-md"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={status === "loading"}
                  className="mt-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:bg-indigo-500 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-indigo-600/60"
                >
                  {status === "loading" ? "Generating..." : "Generate Plan"}
                </button>
                {status === "error" && (
                  <p className="text-sm text-rose-600">
                    {errorMessage ??
                      "Something went wrong. Check your API key and try again."}
                  </p>
                )}
                {summary && (
                  <div className="rounded-xl border border-indigo-600/20 bg-indigo-600/10 p-4 text-sm text-neutral-600">
                    {summary}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};