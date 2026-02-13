import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", xp_cost: 500, icon: "🎁" });

  const fetch = () => supabase.from("rewards").select("*").order("xp_cost").then(({ data }) => setRewards(data || []));
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    const payload = { ...form, xp_cost: Number(form.xp_cost) };
    if (editing) {
      await supabase.from("rewards").update(payload).eq("id", editing.id);
      toast.success("Updated");
    } else {
      await supabase.from("rewards").insert(payload);
      toast.success("Created");
    }
    setOpen(false); setEditing(null); setForm({ title: "", description: "", xp_cost: 500, icon: "🎁" }); fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-foreground">Rewards</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-warm text-primary-foreground font-bold shadow-warm">
              <Plus className="w-4 h-4 mr-1" /> Add Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Reward</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Title (e.g., ₹100 Amazon Voucher)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
              <Input type="number" placeholder="XP Cost" value={form.xp_cost} onChange={(e) => setForm({ ...form, xp_cost: Number(e.target.value) })} className="rounded-xl" />
              <Input placeholder="Emoji icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="rounded-xl" />
              <Button onClick={handleSave} className="w-full rounded-xl bg-gradient-warm text-primary-foreground font-bold">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {rewards.map((r) => (
          <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="text-2xl">{r.icon}</div>
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">{r.title}</p>
              <p className="text-xs text-xp font-semibold">{r.xp_cost} XP</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm({ title: r.title, description: r.description || "", xp_cost: r.xp_cost, icon: r.icon }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("rewards").delete().eq("id", r.id); fetch(); }}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
