import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, CheckCircle2, Play, Zap } from "lucide-react";

interface LessonCardProps {
  id: string;
  title: string;
  orderIndex: number;
  isLocked: boolean;
  isCompleted: boolean;
  xpReward: number;
}

export default function LessonCard({
  id,
  title,
  orderIndex,
  isLocked,
  isCompleted,
  xpReward,
}: LessonCardProps) {
  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      <Link
        to={!isLocked ? `/lesson/${id}` : "#"}
        className={`block p-4 rounded-lg border-2 transition-all ${
          isLocked
            ? "border-muted bg-muted/30 cursor-not-allowed opacity-60"
            : isCompleted
            ? "border-primary/30 bg-primary/5 hover:border-primary/50"
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-muted-foreground">
                Lesson {orderIndex + 1}
              </span>
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary" />}
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="font-semibold text-sm line-clamp-2">{title}</p>
          </div>

          {!isLocked && (
            <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">
              <Zap className="w-3 h-3" />
              {xpReward}
            </div>
          )}
        </div>

        {isLocked && (
          <p className="text-xs text-muted-foreground mt-2">
            Complete previous lesson to unlock
          </p>
        )}

        {!isLocked && !isCompleted && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Play className="w-3 h-3" />
            Start learning
          </div>
        )}
      </Link>
    </motion.div>
  );
}
