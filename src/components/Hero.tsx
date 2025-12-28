import { motion } from "framer-motion";

export const Hero = () => (
  <div className="relative isolate px-6 pt-14 lg:px-8">
    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div className="text-center">
        <motion.h1
          className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Living Roadmap
        </motion.h1>
        <motion.p
          className="mt-6 text-lg leading-8 text-gray-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Turn a goal into a plan you can actually follow. Living Roadmap builds
          focused paths with clear milestones, resources, and review cycles.
        </motion.p>
      </div>
    </div>
  </div>
);