import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Gift, Zap, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Rewards() {
  const { profile, user } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("rewards").select("*").eq("is_active", true).then(({ data }) => {
      setRewards(data || []);
    });
  }, []);

  const handleRedeem = async (reward: any) => {
    if (!user) return;
    if ((profile?.xp || 0) < reward.xp_cost) {
      toast.error("Not enough XP! Keep learning to earn more.");
      return;
    }
    const { error } = await supabase.from("redemptions").insert({
      user_id: user.id,
      reward_id: reward.id,
      status: "pending",
    });
    if (error) {
      toast.error("Failed to redeem. Try again.");
    } else {
      toast.success("🎉 Reward redeemed! Check your email for the voucher.");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">Rewards</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Redeem your XP for real rewards</p>

        {/* Balance */}
        <div className="rounded-2xl bg-gradient-warm p-5 mb-6 shadow-warm text-center">
          <p className="text-primary-foreground/80 text-sm font-semibold">Your Balance</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Zap className="w-7 h-7 text-primary-foreground" />
            <span className="text-4xl font-extrabold text-primary-foreground">{profile?.xp || 0}</span>
          </div>
          <p className="text-primary-foreground/70 text-xs mt-1">XP Points</p>
        </div>

        {/* Reward Items */}
        <div className="space-y-3">
          {rewards.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border-2 border-border bg-card p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                  {r.icon || "🎁"}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{r.title}</h3>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className="w-3.5 h-3.5 text-xp" />
                    <span className="text-sm font-bold text-xp">{r.xp_cost} XP</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleRedeem(r)}
                  disabled={(profile?.xp || 0) < r.xp_cost}
                  className="rounded-xl bg-gradient-warm text-primary-foreground font-bold shadow-warm hover:opacity-90 disabled:opacity-40"
                >
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  Redeem
                </Button>
              </div>
            </motion.div>
          ))}
          {rewards.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No rewards available yet</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
