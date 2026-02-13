import { Zap } from "lucide-react";
import { getXpForNextLevel } from "@/lib/lessonUtils";

interface LevelBadgeProps {
  level: number;
  xp: number;
  xpToNextLevel?: number;
}

export default function LevelBadge({ level, xp, xpToNextLevel }: LevelBadgeProps) {
  const nextLevelXp = xpToNextLevel || getXpForNextLevel(level);
  const xpPercentage = (xp / nextLevelXp) * 100;

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
        {level}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">Level {level}</p>
        <div className="w-full bg-muted rounded-full h-2 mt-1 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(xpPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {xp} / {nextLevelXp} XP
        </p>
      </div>
      <Zap className="w-5 h-5 text-primary" />
    </div>
  );
}
