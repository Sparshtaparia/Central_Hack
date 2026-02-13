import { useAuth } from "@/lib/auth";
import { XPBadge, StreakBadge, LevelBadge } from "@/components/XPBadge";
import CourseCard from "@/components/CourseCard";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, BookOpen, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("courses").select("*").eq("is_published", true).order("sort_order").then(({ data }) => setCourses(data || []));
    supabase.from("notifications").select("*").eq("is_sent", true).order("created_at", { ascending: false }).limit(3).then(({ data }) => setNotifications(data || []));
  }, []);

  const displayName = profile?.name || "Learner";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-foreground">
            {firstName} <span className="inline-block">👋</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <StreakBadge streak={profile?.streak || 0} />
          <XPBadge xp={profile?.xp || 0} />
        </div>
      </motion.div>

      {/* Daily Goal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-primary p-5 mb-6 shadow-warm"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
          <h2 className="text-lg font-bold text-primary-foreground">Daily Goal</h2>
        </div>
        <p className="text-primary-foreground/80 text-sm mb-3">Complete 1 lesson today to keep your streak!</p>
        <div className="h-3 rounded-full bg-primary-foreground/20 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary-foreground/80"
            initial={{ width: 0 }}
            animate={{ width: "33%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-primary-foreground/70 text-xs mt-1.5 font-semibold">1 of 3 lessons</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: TrendingUp, label: "Level", value: profile?.level || 1, color: "text-level" },
          { icon: Sparkles, label: "Total XP", value: profile?.xp || 0, color: "text-xp" },
          { icon: BookOpen, label: "Courses", value: courses.length, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-card rounded-xl p-3 text-center border border-border"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-extrabold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5"><Bell className="w-4 h-4 text-primary" /> Recent Updates</h2>
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="p-3 rounded-xl border border-border bg-card">
                <p className="font-bold text-xs text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-3">Your Courses</h2>
        <div className="space-y-3">
          {courses.length > 0 ? (
            courses.map((c) => (
              <CourseCard key={c.id} id={c.id} title={c.title} category={c.category} icon={c.icon} color={c.color} progress={0} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No courses yet</p>
              <p className="text-sm">Courses will appear here once added by admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
