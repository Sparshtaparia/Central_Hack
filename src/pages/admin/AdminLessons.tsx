import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft, Video, FileText, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLessons() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitForm, setUnitForm] = useState({ title: "" });
  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", unit_id: "", video_url: "", transcript_en: "", transcript_hi: "", xp_reward: 10, type: "video_quiz" });
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([{ question: "", options: ["", "", "", ""], correct: 0 }]);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const fetchAll = async () => {
    if (!courseId) return;
    const { data: c } = await supabase.from("courses").select("*").eq("id", courseId).single();
    setCourse(c);
    const { data: u } = await supabase.from("units").select("*").eq("course_id", courseId).order("sort_order");
    setUnits(u || []);
    if (u && u.length > 0) {
      const { data: l } = await supabase.from("lessons").select("*").in("unit_id", u.map((x: any) => x.id)).order("sort_order");
      setLessons(l || []);
    }
  };

  useEffect(() => { fetchAll(); }, [courseId]);

  const createUnit = async () => {
    if (!unitForm.title.trim()) { toast.error("Title required"); return; }
    await supabase.from("units").insert({ title: unitForm.title, course_id: courseId!, sort_order: units.length });
    toast.success("Unit created");
    setUnitOpen(false);
    setUnitForm({ title: "" });
    fetchAll();
  };

  const deleteUnit = async (id: string) => {
    if (!confirm("Delete unit and all its lessons?")) return;
    // Delete lessons in unit first
    await supabase.from("lessons").delete().eq("unit_id", id);
    await supabase.from("units").delete().eq("id", id);
    toast.success("Unit deleted");
    fetchAll();
  };

  const saveLesson = async () => {
    if (!lessonForm.title.trim() || !lessonForm.unit_id) { toast.error("Title and unit required"); return; }
    const payload = { ...lessonForm, xp_reward: Number(lessonForm.xp_reward) };
    if (editingLesson) {
      await supabase.from("lessons").update(payload).eq("id", editingLesson.id);
      toast.success("Lesson updated");
    } else {
      const unitLessons = lessons.filter(l => l.unit_id === lessonForm.unit_id);
      await supabase.from("lessons").insert({ ...payload, sort_order: unitLessons.length });
      toast.success("Lesson created");
    }
    setLessonOpen(false);
    setEditingLesson(null);
    setLessonForm({ title: "", unit_id: "", video_url: "", transcript_en: "", transcript_hi: "", xp_reward: 10, type: "video_quiz" });
    fetchAll();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    await supabase.from("quizzes").delete().eq("lesson_id", id);
    await supabase.from("lessons").delete().eq("id", id);
    toast.success("Deleted");
    fetchAll();
  };

  const openQuizEditor = async (lessonId: string) => {
    setQuizLessonId(lessonId);
    const { data } = await supabase.from("quizzes").select("*").eq("lesson_id", lessonId).single();
    if (data && Array.isArray(data.questions) && (data.questions as any[]).length > 0) {
      setQuizQuestions(data.questions as any[]);
    } else {
      setQuizQuestions([{ question: "", options: ["", "", "", ""], correct: 0 }]);
    }
    setQuizOpen(true);
  };

  const saveQuiz = async () => {
    const valid = quizQuestions.every(q => q.question.trim() && q.options.every((o: string) => o.trim()));
    if (!valid) { toast.error("Fill all questions and options"); return; }
    await supabase.from("quizzes").upsert({ lesson_id: quizLessonId, questions: quizQuestions }, { onConflict: "lesson_id" });
    toast.success("Quiz saved");
    setQuizOpen(false);
  };

  const addQuestion = () => setQuizQuestions([...quizQuestions, { question: "", options: ["", "", "", ""], correct: 0 }]);
  const removeQuestion = (i: number) => setQuizQuestions(quizQuestions.filter((_, idx) => idx !== i));

  if (!course) return <div className="text-muted-foreground p-4">Loading...</div>;

  return (
    <div>
      <Link to="/admin/courses" className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Back to Courses</span>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{course.icon}</span>
        <h2 className="text-xl font-extrabold text-foreground flex-1">{course.title}</h2>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <Dialog open={unitOpen} onOpenChange={setUnitOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl font-bold"><Plus className="w-4 h-4 mr-1" /> Add Unit</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Unit</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Unit title (e.g., Understanding Money)" value={unitForm.title} onChange={(e) => setUnitForm({ title: e.target.value })} className="rounded-xl" />
              <Button onClick={createUnit} className="w-full rounded-xl bg-primary text-primary-foreground font-bold">Create</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={lessonOpen} onOpenChange={(v) => { setLessonOpen(v); if (!v) setEditingLesson(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary text-primary-foreground font-bold shadow-warm"><Plus className="w-4 h-4 mr-1" /> Add Lesson</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingLesson ? "Edit" : "New"} Lesson</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Lesson title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="rounded-xl" />
              <Select value={lessonForm.unit_id} onValueChange={(v) => setLessonForm({ ...lessonForm, unit_id: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent portal={true}>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video_quiz">Video + Quiz</SelectItem>
                  <SelectItem value="video">Video Only</SelectItem>
                  <SelectItem value="quiz">Quiz Only</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="YouTube URL" value={lessonForm.video_url} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Transcript (English)" rows={3} value={lessonForm.transcript_en} onChange={(e) => setLessonForm({ ...lessonForm, transcript_en: e.target.value })} className="rounded-xl" />
              <Textarea placeholder="Transcript (Hindi)" rows={3} value={lessonForm.transcript_hi} onChange={(e) => setLessonForm({ ...lessonForm, transcript_hi: e.target.value })} className="rounded-xl" />
              <Input type="number" placeholder="XP Reward" value={lessonForm.xp_reward} onChange={(e) => setLessonForm({ ...lessonForm, xp_reward: Number(e.target.value) })} className="rounded-xl" />
              <Button onClick={saveLesson} className="w-full rounded-xl bg-primary text-primary-foreground font-bold">Save Lesson</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Units & Lessons */}
      {units.map(unit => {
        const unitLessons = lessons.filter(l => l.unit_id === unit.id);
        return (
          <div key={unit.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📖</span>
              <h3 className="font-extrabold text-foreground text-sm flex-1">{unit.title}</h3>
              <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => deleteUnit(unit.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-2 ml-4">
              {unitLessons.map((l, i) => (
                <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
                    {l.type === "quiz" ? <HelpCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.type} • {l.xp_reward} XP</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openQuizEditor(l.id)}>
                    <HelpCircle className="w-3.5 h-3.5 text-accent" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                    setEditingLesson(l);
                    setLessonForm({
                      title: l.title, unit_id: l.unit_id, video_url: l.video_url || "",
                      transcript_en: l.transcript_en || "", transcript_hi: l.transcript_hi || "",
                      xp_reward: l.xp_reward, type: l.type,
                    });
                    setLessonOpen(true);
                  }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteLesson(l.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
              {unitLessons.length === 0 && <p className="text-xs text-muted-foreground py-1">No lessons in this unit</p>}
            </div>
          </div>
        );
      })}

      {/* Quiz Editor Dialog */}
      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto max-w-lg">
          <DialogHeader><DialogTitle>Quiz Editor</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            {quizQuestions.map((q, qi) => (
              <div key={qi} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">Q{qi + 1}</span>
                  {quizQuestions.length > 1 && (
                    <Button size="sm" variant="ghost" className="text-destructive h-6 text-xs" onClick={() => removeQuestion(qi)}>Remove</Button>
                  )}
                </div>
                <Input placeholder="Question" value={q.question} onChange={(e) => {
                  const updated = [...quizQuestions]; updated[qi].question = e.target.value; setQuizQuestions(updated);
                }} className="rounded-lg" />
                {q.options.map((opt: string, oi: number) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correct === oi}
                      onChange={() => { const updated = [...quizQuestions]; updated[qi].correct = oi; setQuizQuestions(updated); }}
                      className="accent-primary"
                    />
                    <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => {
                      const updated = [...quizQuestions]; updated[qi].options[oi] = e.target.value; setQuizQuestions(updated);
                    }} className="rounded-lg flex-1" />
                  </div>
                ))}
              </div>
            ))}
            <Button variant="outline" onClick={addQuestion} className="w-full rounded-xl"><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
            <Button onClick={saveQuiz} className="w-full rounded-xl bg-primary text-primary-foreground font-bold">Save Quiz</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
