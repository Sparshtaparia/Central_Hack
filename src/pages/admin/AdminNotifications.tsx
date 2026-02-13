import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Send, Bell, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "general" });

  const fetchAll = () => {
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).then(({ data }) => setNotifications(data || []));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error("Title and message required"); return; }
    const { error } = await supabase.from("notifications").insert(form);
    if (error) { toast.error(error.message); return; }
    toast.success("Notification created");
    setOpen(false);
    setForm({ title: "", message: "", type: "general" });
    fetchAll();
  };

  const handleSend = async (id: string) => {
    await supabase.from("notifications").update({ is_sent: true, sent_at: new Date().toISOString() }).eq("id", id);
    toast.success("Notification sent to all users!");
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-extrabold text-foreground">Notifications</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary text-primary-foreground font-bold shadow-warm">
              <Plus className="w-4 h-4 mr-1" /> Create
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Notification</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-xl" />
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="reminder">Daily Reminder</SelectItem>
                  <SelectItem value="new_lesson">New Lesson</SelectItem>
                  <SelectItem value="reward">Reward Unlocked</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full rounded-xl bg-primary text-primary-foreground font-bold">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.is_sent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {n.is_sent ? <Send className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground">{n.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">{n.type}</span>
                {n.is_sent && <span className="text-[10px] text-primary font-semibold">Sent</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!n.is_sent && (
                <Button size="sm" variant="outline" onClick={() => handleSend(n.id)} className="rounded-lg text-xs h-7">
                  <Send className="w-3 h-3 mr-1" /> Send
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)} className="rounded-lg text-xs h-7 text-destructive">✕</Button>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
