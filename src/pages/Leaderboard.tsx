import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Crown, Medal } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [tab, setTab] = useState<"weekly" | "all">("all");

  useEffect(() => {
    supabase.from("profiles").select("*").order("xp", { ascending: false }).limit(50).then(({ data }) => {
      setLeaders(data || []);
    });
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-xp fill-current" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-streak" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-6 h-6 text-xp" />
          <h1 className="text-2xl font-extrabold text-foreground">Leaderboard</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Compete with fellow learners</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "weekly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {t === "all" ? "All Time" : "This Week"}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {leaders.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[1, 0, 2].map((idx) => {
              const l = leaders[idx];
              const isFirst = idx === 0;
              return (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-${isFirst ? 16 : 12} h-${isFirst ? 16 : 12} rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-bold text-${isFirst ? "xl" : "base"} mb-2 ${isFirst ? "shadow-warm" : ""}`}
                    style={{ width: isFirst ? 64 : 48, height: isFirst ? 64 : 48 }}
                  >
                    {l.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <p className="text-xs font-bold text-foreground truncate max-w-[80px]">{l.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3 text-xp" />
                    <span className="text-xs font-bold text-xp">{l.xp}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        <div className="space-y-2">
          {leaders.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-xl border border-border ${
                l.user_id === user?.id ? "bg-primary/10 border-primary/30" : "bg-card"
              }`}
            >
              {getRankIcon(i + 1)}
              <div className="w-9 h-9 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {l.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">
                  {l.name} {l.user_id === user?.id && <span className="text-primary">(You)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Lvl {l.level}</span>
                  <Flame className="w-3 h-3 text-streak" />
                  <span className="text-xs text-muted-foreground">{l.streak}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-xp" />
                <span className="font-bold text-sm text-foreground">{l.xp}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
