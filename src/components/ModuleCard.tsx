import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import LessonCard from "./LessonCard";
import { isLessonLocked } from "@/lib/lessonUtils";

interface Lesson {
  id: string;
  title: string;
  order_index: number;
  xp_reward: number;
}

interface ModuleCardProps {
  id: string;
  title: string;
  moduleIndex: number;
  lessons: Lesson[];
  userProgress: Record<string, any>;
}

export default function ModuleCard({
  id,
  title,
  moduleIndex,
  lessons,
  userProgress,
}: ModuleCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate completion percentage
  const completedCount = lessons.filter(
    (l) => userProgress[l.id]?.completed
  ).length;
  const completionPercentage = (completedCount / lessons.length) * 100;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      {/* Module Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex-1 text-left">
          <h3 className="font-bold text-base mb-1">
            Module {moduleIndex + 1}: {title}
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
              {completedCount}/{lessons.length}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Lessons List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 pt-3 border-t border-border"
          >
            {lessons.map((lesson) => {
              const isCompleted = userProgress[lesson.id]?.completed || false;
              // Use utility function to determine lock status
              const isLocked = isLessonLocked(
                lesson.order_index,
                userProgress,
                lessons
              );

              return (
                <LessonCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  orderIndex={lesson.order_index}
                  isLocked={isLocked}
                  isCompleted={isCompleted}
                  xpReward={lesson.xp_reward}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
