# Goal Architect

Goal Architect is an AI-powered planner that turns vague ambitions into structured, interactive achievement paths. It generates milestone plans with steps, tips, resources, and progress tracking, all wrapped in a soft minimalist UI.

## Features

- AI-generated milestone plans with steps, tips, resources, difficulty, and deliverables
- Soft minimalist, pastel UI with Framer Motion transitions
- Progress tracking with completion toggles and goal health percentage
- Rebalance remaining tasks with the “Life Happened” reshuffle
- Local persistence via Zustand

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Zustand (persist middleware)
- Framer Motion
- OpenAI SDK + Zod validation

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local`:

```bash
OPENAI_API_KEY=sk-...
```

### 3) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## API

### POST `/api/generate-plan`

Request body:

```json
{
  "goalTitle": "Pass the SATs",
  "timeframe": {
    "start": "2025-01-05",
    "end": "2025-03-15"
  },
  "intensity": "Standard"
}
```

Response body:

```json
{
  "milestones": [
    {
      "id": "m1",
      "title": "Diagnostic test",
      "description": "Benchmark your starting point.",
      "category": "Study",
      "status": "pending",
      "estimatedMinutes": 60,
      "estimatedHours": 1,
      "difficulty": "Easy",
      "deliverable": "Baseline score report",
      "steps": ["Pick a practice test", "Timebox 60 minutes", "Review results"],
      "tips": ["Simulate exam conditions"],
      "resources": [
        { "title": "Official SAT Practice", "url": "https://satsuite.collegeboard.org" }
      ]
    }
  ],
  "summary": "A 10-week SAT prep plan with weekly review cycles."
}
```

## Key Files

- UI: `src/app/page.tsx`
- Store: `src/lib/store/goalStore.ts`
- Types: `src/lib/types/goal.ts`
- API: `src/app/api/generate-plan/route.ts`

## Notes

- The API enforces strict JSON + schema validation and returns `422` if the LLM output is invalid.
- Regenerate the plan after schema updates to populate new fields.
