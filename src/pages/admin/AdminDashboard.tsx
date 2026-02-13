import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, BookOpen, Award, TrendingUp, Zap, Gift } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, courses: 0, rewards: 0, redemptions: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("rewards").select("id", { count: "exact", head: true }),
      supabase.from("redemptions").select("id", { count: "exact", head: true }),
    ]).then(([u, c, r, rd]) => {
      setStats({
        users: u.count || 0,
        courses: c.count || 0,
        rewards: r.count || 0,
        redemptions: rd.count || 0,
      });
    });
  }, []);

  const cards = [
    { icon: Users, label: "Total Users", value: stats.users, color: "text-accent" },
    { icon: BookOpen, label: "Courses", value: stats.courses, color: "text-secondary" },
    { icon: Gift, label: "Rewards", value: stats.rewards, color: "text-xp" },
    { icon: Award, label: "Redemptions", value: stats.redemptions, color: "text-level" },
  ];

  return (
    <div>
      <h2 className="text-xl font-extrabold text-foreground mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <card.icon className={`w-6 h-6 mb-2 ${card.color}`} />
            <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground font-semibold">{card.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
