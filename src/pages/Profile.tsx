import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { XPBadge, StreakBadge, LevelBadge } from "@/components/XPBadge";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Shield, BookOpen, Award, ChevronRight, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { profile, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ completed: 0, totalXp: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from("user_progress").select("xp_earned").eq("user_id", user.id).eq("completed", true)
      .then(({ data }) => {
        setStats({
          completed: data?.length || 0,
          totalXp: (data || []).reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0),
        });
      });
  }, [user]);

  const menuItems = [
    ...(isAdmin ? [{ icon: Shield, label: "Admin Panel", action: () => navigate("/admin") }] : []),
    { icon: BookOpen, label: `Lessons Completed: ${stats.completed}`, action: () => {} },
    { icon: Award, label: "Achievements", action: () => {} },
    { icon: Bell, label: "Notifications", action: () => {} },
    { icon: Settings, label: "Settings", action: () => {} },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-3xl text-primary-foreground font-bold mx-auto mb-3 shadow-warm">
            {profile?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <h1 className="text-xl font-extrabold text-foreground">{profile?.name || "Learner"}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <LevelBadge level={profile?.level || 1} />
            <XPBadge xp={profile?.xp || 0} />
            <StreakBadge streak={profile?.streak || 0} />
          </div>
        </div>

        {/* XP Progress */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-foreground">Level {profile?.level || 1}</span>
            <span className="text-muted-foreground">Level {(profile?.level || 1) + 1}</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((profile?.xp || 0) % 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{(profile?.xp || 0) % 100}/100 XP to next level</p>
        </div>

        {/* Menu */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-left"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="flex-1 font-semibold text-foreground">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button
          onClick={signOut}
          variant="outline"
          className="w-full h-12 rounded-xl text-destructive border-destructive/30 font-bold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
