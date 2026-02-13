import { motion } from "framer-motion";
import { Flame, Zap, Star } from "lucide-react";

export function XPBadge({ xp }: { xp: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 bg-xp/15 text-xp px-3 py-1.5 rounded-full font-bold text-sm"
    >
      <Zap className="w-4 h-4 fill-current" />
      {xp} XP
    </motion.div>
  );
}

export function StreakBadge({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-streak/15 text-streak px-3 py-1.5 rounded-full font-bold text-sm">
      <Flame className="w-4 h-4 fill-current" />
      {streak}
    </div>
  );
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5 bg-level/15 text-level px-3 py-1.5 rounded-full font-bold text-sm">
      <Star className="w-4 h-4 fill-current" />
      Lvl {level}
    </div>
  );
}
