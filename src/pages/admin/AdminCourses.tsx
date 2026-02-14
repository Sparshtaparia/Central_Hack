import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CATEGORIES = ["Personal Finance", "Corporate Finance", "Economics", "Trading", "Investing", "Stock Market", "Bonds", "Financial News"];
const ICONS = ["📚", "💰", "📈", "🏦", "💳", "📊", "🎯", "🌾", "🏠", "💡"];

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Personal Finance", icon: "📚", color: "#58CC02" });

  const fetchCourses = () => {
    supabase.from("courses").select("*").order("sort_order").then(({ data }) => setCourses(data || []));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    if (editing) {
      const { error } = await supabase.from("courses").update(form).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Course updated");
    } else {
      // Automatically set is_published to true for new courses so they appear in Academy
      const { error } = await supabase.from("courses").insert({ ...form, is_published: true });
      if (error) { toast.error(error.message); return; }
      toast.success("Course created");
    }
    setOpen(false);
    setEditing(null);
    setForm({ title: "", description: "", category: "Personal Finance", icon: "📚", color: "#58CC02" });
    fetchCourses();
  };

  const togglePublish = async (course: any) => {
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id);
    fetchCourses();
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    await supabase.from("courses").delete().eq("id", id);
    fetchCourses();
    toast.success("Course deleted");
  };

  const openEdit = (course: any) => {
    setEditing(course);
    setForm({ title: course.title, description: course.description || "", category: course.category, icon: course.icon, color: course.color });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-foreground">Courses</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ title: "", description: "", category: "Personal Finance", icon: "📚", color: "#58CC02" }); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary text-primary-foreground font-bold shadow-warm">
              <Plus className="w-4 h-4 mr-1" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Course" : "New Course"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <div>
                <p className="text-sm font-semibold mb-2 text-foreground">Icon</p>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map((ic) => (
                    <button key={ic} onClick={() => setForm({ ...form, icon: ic })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${form.icon === ic ? "bg-primary/20 ring-2 ring-primary" : "bg-muted"}`}>{ic}</button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full rounded-xl bg-primary text-primary-foreground font-bold">
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {courses.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: c.color + "20" }}>{c.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.category}</p>
            </div>
            <div className="flex items-center gap-1">
              <Link to={`/admin/courses/${c.id}/lessons`}>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <BookOpen className="w-4 h-4 text-primary" />
                </Button>
              </Link>
              <Button size="icon" variant="ghost" onClick={() => togglePublish(c)} className="h-8 w-8">
                {c.is_published ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="h-8 w-8">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteCourse(c.id)} className="h-8 w-8 text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
