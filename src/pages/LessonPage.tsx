import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Zap, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const PASSING_SCORE = 70; // 70% required to pass

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
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single()
      .then(({ data }) => setLesson(data));

    supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .single()
      .then(({ data }) => setQuiz(data));

    if (user) {
      supabase
        .from("user_progress")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.completed) setCompleted(true);
        });
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

    // Check if passing score
    if (pct >= PASSING_SCORE) {
      // Record progress & award XP
      const xpEarned = lesson?.xp_reward || 10;
      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          lesson_id: lessonId!,
          completed: true,
          completed_at: new Date().toISOString(),
          score: pct,
          xp_earned: xpEarned,
        },
        { onConflict: "user_id,lesson_id" }
      );

      // Update profile XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level, streak, last_active")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + xpEarned;
        const newLevel = Math.floor(newXp / 100) + 1;
        const today = new Date().toISOString().slice(0, 10);
        const lastActive = profile.last_active;
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .slice(0, 10);
        let newStreak = profile.streak || 0;
        if (lastActive === yesterday) newStreak += 1;
        else if (lastActive !== today) newStreak = 1;

        await supabase
          .from("profiles")
          .update({
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            last_active: today,
          })
          .eq("user_id", user.id);
      }

      setCompleted(true);
      toast.success(`Passed! +${xpEarned} XP earned!`);
    } else {
      toast.error(`Score ${pct}%. Need ${PASSING_SCORE}% to pass.`);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const handleMarkComplete = async () => {
    if (!user) return;
    const xpEarned = lesson.xp_reward || 10;
    await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId!,
        completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
      },
      { onConflict: "user_id,lesson_id" }
    );
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level, streak, last_active")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.xp || 0) + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      const today = new Date().toISOString().slice(0, 10);
      const lastActive = profile.last_active;
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .slice(0, 10);
      let newStreak = profile.streak || 0;
      if (lastActive === yesterday) newStreak += 1;
      else if (lastActive !== today) newStreak = 1;

      await supabase
        .from("profiles")
        .update({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          last_active: today,
        })
        .eq("user_id", user.id);
    }

    setCompleted(true);
    toast.success(`Completed! +${xpEarned} XP earned!`);
  };

  if (!lesson) return <div className="text-center py-12">Loading...</div>;

  const ytId = getYouTubeId(lesson.video_url || "");
  const questions = (quiz?.questions as any[]) || [];
  const answered = Object.keys(answers).length;
  const allAnswered = answered === questions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/app/academy"
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Academy
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              {completed && (
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Completed
                </div>
              )}
            </div>
          </div>

          {!completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20"
            >
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">+{lesson.xp_reward} XP</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Video Player */}
      {ytId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <VideoPlayer youtubeId={ytId} title={lesson.title} />
          <p className="text-xs text-muted-foreground">
            Watch the video to learn the concept
          </p>
        </motion.div>
      )}

      {/* Transcript */}
      {lesson.transcript_en && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/50 p-6 rounded-lg border border-border"
        >
          <h3 className="font-bold mb-3 flex items-center gap-2">
            📝 Transcript
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {lesson.transcript_en}
          </p>
        </motion.div>
      )}

      {/* Quiz */}
      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 bg-card p-6 rounded-lg border border-border"
        >
          <div>
            <h2 className="text-2xl font-bold mb-2">Quiz Time</h2>
            <p className="text-sm text-muted-foreground">
              Answer {questions.length} questions correctly to pass. You need at least {PASSING_SCORE}%
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Progress</span>
              <span>
                {answered}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(answered / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q: any, qi: number) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: qi * 0.05 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-sm">
                  <span className="text-primary">Q{qi + 1}.</span> {q.question}
                </h3>

                <div className="space-y-2">
                  {(q.options as string[]).map((opt: string, oi: number) => {
                    const selected = answers[qi] === oi;
                    const isCorrect = submitted && oi === q.correct;
                    const isWrong =
                      submitted && selected && oi !== q.correct;

                    return (
                      <button
                        key={oi}
                        onClick={() =>
                          !submitted &&
                          setAnswers({ ...answers, [qi]: oi })
                        }
                        disabled={submitted}
                        className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-all border-2 cursor-pointer ${
                          isCorrect
                            ? "border-green-500 bg-green-500/10 text-green-600"
                            : isWrong
                            ? "border-red-500 bg-red-500/10 text-red-600"
                            : selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Submit/Results */}
          {!submitted ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={!allAnswered}
              className="w-full h-12 text-base font-bold"
            >
              Submit Quiz
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`space-y-4 p-6 rounded-lg border-2 ${
                score >= PASSING_SCORE
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  <span
                    className={
                      score >= PASSING_SCORE
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {score}%
                  </span>
                </div>
                {score >= PASSING_SCORE ? (
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-green-600">
                      Congratulations! You passed!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +{lesson.xp_reward} XP earned
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-lg text-red-600">
                      Almost there! Need {PASSING_SCORE}% to pass
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You got {score}%. Try again!
                    </p>
                  </div>
                )}
              </div>

              {score < PASSING_SCORE && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full h-11"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Complete without quiz */}
      {questions.length === 0 && !completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleMarkComplete}
            className="w-full h-12 text-base font-bold"
          >
            Mark as Complete
          </Button>
        </motion.div>
      )}
    </div>
  );
}
