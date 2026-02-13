import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Check, Lock, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function CoursePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    supabase.from("courses").select("*").eq("id", courseId).single().then(({ data }) => setCourse(data));
    supabase.from("units").select("*").eq("course_id", courseId).order("sort_order").then(({ data }) => {
      setUnits(data || []);
      if (data && data.length > 0) setExpandedUnit(data[0].id);
    });
  }, [courseId]);

  useEffect(() => {
    if (units.length === 0) return;
    const unitIds = units.map(u => u.id);
    supabase.from("lessons").select("*").in("unit_id", unitIds).order("sort_order").then(({ data }) => setLessons(data || []));
  }, [units]);

  useEffect(() => {
    if (!user || lessons.length === 0) return;
    const lessonIds = lessons.map(l => l.id);
    supabase.from("user_progress").select("lesson_id, completed").eq("user_id", user.id).in("lesson_id", lessonIds)
      .then(({ data }) => {
        const map: Record<string, boolean> = {};
        (data || []).forEach((p: any) => { if (p.completed) map[p.lesson_id] = true; });
        setProgress(map);
      });
  }, [user, lessons]);

  if (!course) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;

  const totalLessons = lessons.length;
  const completedLessons = Object.values(progress).filter(Boolean).length;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Determine first incomplete lesson
  const completedSet = new Set(Object.keys(progress));
  let firstIncompleteLessonId: string | null = null;
  for (const unit of units) {
    const unitLessons = lessons.filter(l => l.unit_id === unit.id);
    for (const l of unitLessons) {
      if (!completedSet.has(l.id)) {
        firstIncompleteLessonId = l.id;
        break;
      }
    }
    if (firstIncompleteLessonId) break;
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <Link to="/app/academy" className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Back</span>
      </Link>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Course Header - Duolingo style */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: (course.color || "#58CC02") + "20" }}>
              {course.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-extrabold text-foreground">{course.title}</h1>
              <p className="text-xs text-muted-foreground truncate">{course.description}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={progressPct} className="flex-1 h-3" />
            <span className="text-sm font-bold text-primary">{progressPct}%</span>
          </div>
        </div>

        {/* Units & Lessons - Duolingo list style per reference image */}
        {units.map((unit) => {
          const unitLessons = lessons.filter(l => l.unit_id === unit.id);
          const isExpanded = expandedUnit === unit.id;
          return (
            <div key={unit.id} className="mb-4">
              <button
                onClick={() => setExpandedUnit(isExpanded ? null : unit.id)}
                className="w-full flex items-center gap-2 mb-2"
              >
                <span className="text-lg">📖</span>
                <h2 className="font-extrabold text-foreground text-sm flex-1 text-left">{unit.title}</h2>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {isExpanded && (
                <div className="space-y-2 ml-2">
                  {unitLessons.map((lesson, i) => {
                    const isCompleted = progress[lesson.id];
                    const isCurrent = lesson.id === firstIncompleteLessonId;
                    const isLocked = !isCompleted && !isCurrent;
                    // Allow all lessons to be clickable for now
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={`/app/lesson/${lesson.id}`}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                            isCompleted ? "border-primary/30 bg-primary/5" :
                            isCurrent ? "border-primary bg-primary/10 shadow-warm" :
                            "border-border bg-card opacity-70"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isCompleted ? "bg-primary text-primary-foreground" :
                            isCurrent ? "bg-primary/20 text-primary" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" /> :
                             isLocked ? <Lock className="w-3.5 h-3.5" /> :
                             <span className="text-xs font-bold">{i + 1}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground">{lesson.title}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Zap className="w-3 h-3 text-xp" />
                              <span className="text-xs font-semibold text-xp">+{lesson.xp_reward} XP</span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                  {unitLessons.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2 pl-2">No lessons yet</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {units.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No content yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
