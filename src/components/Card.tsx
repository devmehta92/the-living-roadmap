import type { Milestone } from "@/lib/types/goal";

interface CardProps {
  milestone: Milestone;
  previewLimit: number;
}

export const Card = ({ milestone, previewLimit }: CardProps) => (
  <div
    key={`${milestone.id}-detail`}
    className="min-w-0 rounded-2xl border border-neutral-100 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:border-primary-light"
  >
    <div className="flex items-center justify-between">
      <p className="break-words text-base font-semibold text-neutral-800">
        {milestone.title}
      </p>
      <span className="text-sm text-neutral-400">
        {milestone.estimatedHours} hr
      </span>
    </div>
    <p className="mt-2 break-words text-sm text-neutral-500">
      {milestone.description}
    </p>
    <div className="mt-4 grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
      <div>
        <p className="font-semibold text-neutral-400">Steps</p>
        <ul className="mt-2 space-y-2">
          {milestone.steps.slice(0, previewLimit).map((step) => (
            <li key={step} className="flex gap-3 break-words">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary/40" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-semibold text-neutral-400">Tips</p>
        <ul className="mt-2 space-y-2">
          {milestone.tips.slice(0, previewLimit).map((tip) => (
            <li key={tip} className="flex gap-3 break-words">
              <span className="mt-1 h-2 w-2 rounded-full bg-secondary/40" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-4 text-sm text-neutral-600">
      <p className="font-semibold text-neutral-400">Resources</p>
      <div className="mt-2 flex flex-col gap-2">
        {milestone.resources.slice(0, previewLimit).map((resource) => (
          <a
            key={`${milestone.id}-${resource.title}`}
            href={resource.url}
            target="_blank"
            rel="noreferrer"
            className="break-words text-primary underline-offset-2 hover:underline"
          >
            {resource.title}
          </a>
        ))}
      </div>
    </div>
  </div>
);