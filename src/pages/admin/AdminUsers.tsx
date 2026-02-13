import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Zap, Flame, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase.from("profiles").select("*").order("xp", { ascending: false }).then(({ data }) => setUsers(data || []));
  }, []);

  const filtered = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-extrabold text-foreground">Users</h2>
        <span className="ml-auto text-sm text-muted-foreground">{users.length} total</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
      </div>

      <div className="space-y-2">
        {filtered.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-bold text-sm">{u.name?.charAt(0)?.toUpperCase() || "?"}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground">Level {u.level}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-xp" />{u.xp}</span>
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-streak" />{u.streak}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
