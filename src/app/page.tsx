"use client";

import { Goal } from "@/components/Goal";
import { Hero } from "@/components/Hero";
import { NewGoal } from "@/components/NewGoal";

export default function GoalArchitectPage() {
  return (
    <main>
      <Hero />
      <NewGoal />
      <Goal />
    </main>
  );
}