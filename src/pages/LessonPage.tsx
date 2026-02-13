import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Zap, Play } from "lucide-react";
import { toast } from "sonner";

export default function LessonPage() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    supabase.from("lessons").select("*").eq("id", lessonId).single().then(({ data }) => setLesson(data));
    supabase.from("quizzes").select("*").eq("lesson_id", lessonId).single().then(({ data }) => setQuiz(data));
    if (user) {
      supabase.from("user_progress").select("*").eq("lesson_id", lessonId).eq("user_id", user.id).single()
        .then(({ data }) => { if (data?.completed) setCompleted(true); });
    }
  }, [lessonId, user]);

  const getYouTubeId = (url: string) => {
    const match = url?.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;
    const questions = quiz.questions as any[];
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setSubmitted(true);

    // Record progress & award XP
    const xpEarned = lesson?.xp_reward || 10;
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId!,
      completed: true,
      completed_at: new Date().toISOString(),
      score: pct,
      xp_earned: xpEarned,
    }, { onConflict: "user_id,lesson_id" });

    // Update profile XP
    const { data: profile } = await supabase.from("profiles").select("xp, level, streak, last_active").eq("user_id", user.id).single();
    if (profile) {
      const newXp = (profile.xp || 0) + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      const today = new Date().toISOString().slice(0, 10);
      const lastActive = profile.last_active;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let newStreak = profile.streak || 0;
      if (lastActive === yesterday) newStreak += 1;
      else if (lastActive !== today) newStreak = 1;

      await supabase.from("profiles").update({
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        last_active: today,
      }).eq("user_id", user.id);
    }

    setCompleted(true);
    toast.success(`🎉 +${xpEarned} XP earned!`);
  };

  if (!lesson) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;

  const ytId = getYouTubeId(lesson.video_url || "");
  const questions = (quiz?.questions as any[]) || [];

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      <Link to={-1 as any} className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-semibold">Back</span>
      </Link>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl font-extrabold text-foreground mb-1">{lesson.title}</h1>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-xp" />
          <span className="text-sm font-bold text-xp">+{lesson.xp_reward} XP</span>
          {completed && <CheckCircle className="w-4 h-4 text-primary ml-2" />}
        </div>

        {/* Video Player */}
        {ytId && (
          <div className="rounded-2xl overflow-hidden border border-border mb-6 aspect-video bg-foreground/5">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?rel=0`}
              title={lesson.title}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* Transcript */}
        {lesson.transcript_en && (
          <details className="rounded-xl border border-border bg-card p-4 mb-6">
            <summary className="font-bold text-sm text-foreground cursor-pointer">📝 Transcript</summary>
            <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{lesson.transcript_en}</p>
          </details>
        )}

        {/* Quiz */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-pixel text-lg text-foreground">Quiz Time! 🧠</h2>
            {questions.map((q: any, qi: number) => (
              <div key={qi} className="rounded-xl border border-border bg-card p-4">
                <p className="font-bold text-sm text-foreground mb-3">{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {(q.options as string[]).map((opt: string, oi: number) => {
                    const selected = answers[qi] === oi;
                    const isCorrect = submitted && oi === q.correct;
                    const isWrong = submitted && selected && oi !== q.correct;
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers({ ...answers, [qi]: oi })}
                        className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-colors border-2 ${
                          isCorrect ? "border-primary bg-primary/10 text-primary" :
                          isWrong ? "border-destructive bg-destructive/10 text-destructive" :
                          selected ? "border-primary bg-primary/5" :
                          "border-border hover:bg-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < questions.length}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-warm"
              >
                Submit Quiz
              </Button>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-xl bg-primary/10 border-2 border-primary p-6 text-center"
              >
                <p className="font-pixel text-2xl text-primary mb-1">{score}%</p>
                <p className="text-sm text-muted-foreground">+{lesson.xp_reward} XP earned!</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Complete without quiz */}
        {questions.length === 0 && !completed && (
          <Button
            onClick={async () => {
              if (!user) return;
              const xpEarned = lesson.xp_reward || 10;
              await supabase.from("user_progress").upsert({
                user_id: user.id, lesson_id: lessonId!, completed: true,
                completed_at: new Date().toISOString(), xp_earned: xpEarned,
              }, { onConflict: "user_id,lesson_id" });
              const { data: profile } = await supabase.from("profiles").select("xp, level").eq("user_id", user.id).single();
              if (profile) {
                await supabase.from("profiles").update({
                  xp: (profile.xp || 0) + xpEarned,
                  level: Math.floor(((profile.xp || 0) + xpEarned) / 100) + 1,
                  last_active: new Date().toISOString().slice(0, 10),
                }).eq("user_id", user.id);
              }
              setCompleted(true);
              toast.success(`🎉 +${xpEarned} XP earned!`);
            }}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-warm"
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Mark as Complete
          </Button>
        )}
      </motion.div>
    </div>
  );
}
