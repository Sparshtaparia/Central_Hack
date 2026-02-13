import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "General" });

  const fetch = () => supabase.from("articles").select("*").order("created_at", { ascending: false }).then(({ data }) => setArticles(data || []));
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (editing) {
      await supabase.from("articles").update(form).eq("id", editing.id);
      toast.success("Updated");
    } else {
      await supabase.from("articles").insert(form);
      toast.success("Created");
    }
    setOpen(false); setEditing(null); setForm({ title: "", content: "", category: "General" }); fetch();
  };

  const togglePublish = async (a: any) => {
    await supabase.from("articles").update({ is_published: !a.is_published }).eq("id", a.id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-foreground">Articles</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-warm text-primary-foreground font-bold shadow-warm"><Plus className="w-4 h-4 mr-1" /> Add Article</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Article</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
              <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Content (markdown)" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="rounded-xl" />
              <Button onClick={handleSave} className="w-full rounded-xl bg-gradient-warm text-primary-foreground font-bold">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.category}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => togglePublish(a)}>{a.is_published ? <Eye className="w-4 h-4 text-secondary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}</Button>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(a); setForm({ title: a.title, content: a.content, category: a.category }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" className="text-destructive" onClick={async () => { await supabase.from("articles").delete().eq("id", a.id); fetch(); }}><Trash2 className="w-4 h-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
