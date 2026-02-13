import { motion } from "framer-motion";
import { Check, Lock, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface LessonNode {
  id: string;
  title: string;
  status: "completed" | "current" | "locked";
  xpReward: number;
}

export default function LessonPath({ lessons, courseId }: { lessons: LessonNode[]; courseId: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {lessons.map((lesson, index) => {
        const offset = index % 2 === 0 ? -30 : 30;
        return (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
            className="relative"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {index < lessons.length - 1 && (
              <div className="absolute left-1/2 top-full w-0.5 h-4 bg-border -translate-x-1/2" />
            )}
            <Link
              to={lesson.status !== "locked" ? `/app/lesson/${lesson.id}` : "#"}
              className={`lesson-node ${lesson.status}`}
            >
              {lesson.status === "completed" && <Check className="w-6 h-6" />}
              {lesson.status === "current" && <Play className="w-6 h-6" />}
              {lesson.status === "locked" && <Lock className="w-5 h-5" />}
            </Link>
            <p className="text-center text-xs font-semibold mt-2 max-w-[100px] leading-tight text-foreground">
              {lesson.title}
            </p>
            {lesson.status === "current" && (
              <p className="text-center text-[10px] font-bold text-xp mt-0.5">+{lesson.xpReward} XP</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
