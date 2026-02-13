import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Zap, Play, Award, Trophy } from "lucide-react";
import { VIDEO_XP, QUIZ_XP, DEFAULT_QUIZ_QUESTIONS } from "@/lib/lessons-data";

interface LessonXpTrackerProps {
  lessonId: string;
  videoId: string;
  title: string;
  onVideoComplete?: () => void;
}

export default function LessonXpTracker({
  lessonId,
  videoId,
  title,
  onVideoComplete,
}: LessonXpTrackerProps) {
  const { user } = useAuth();
  
  const [videoWatched, setVideoWatched] = useState(false);
  const [videoXpEarned, setVideoXpEarned] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizXpEarned, setQuizXpEarned] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalVideoXp = VIDEO_XP;
  const totalQuizXp = QUIZ_XP;
  const totalLessonXp = totalVideoXp + totalQuizXp;

  useEffect(() => {
    if (!user || !lessonId) return;

    const loadProgress = async () => {
      setLoading(true);
      
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (progressData) {
        const hasProgress = progressData.completed || progressData.xp_earned > 0;
        setVideoWatched(hasProgress);
        setVideoXpEarned(hasProgress);
        setQuizCompleted(progressData.completed || false);
        setQuizXpEarned(progressData.score === 100);
      }

      setLoading(false);
    };

    loadProgress();
  }, [user, lessonId]);

  const awardXp = async (xp: number) => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.xp || 0) + xp;
      const newLevel = Math.floor(newXp / 100) + 1;

      await supabase
        .from("profiles")
        .update({ xp: newXp, level: newLevel })
        .eq("user_id", user.id);
    }
  };

  const handleVideoComplete = async () => {
    if (!user || videoXpEarned) return;

    setVideoWatched(true);
    setVideoXpEarned(true);

    await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: false,
        score: null,
        xp_earned: totalVideoXp,
        completed_at: null,
      },
      { onConflict: "user_id,lesson_id" }
    );

    await awardXp(totalVideoXp);

    if (onVideoComplete) {
      onVideoComplete();
    }

    toast.success(`Video completed! +${totalVideoXp} XP earned!`);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResults) return;
    setAnswers({ ...answers, [currentQuestion]: answerIndex });
  };

  const handleQuizSubmit = async () => {
    if (!user) return;

    const questions = DEFAULT_QUIZ_QUESTIONS;
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    setScore(scorePercentage);
    setShowResults(true);

    const isPerfectScore = scorePercentage === 100;

    setQuizCompleted(true);
    if (isPerfectScore) {
      setQuizXpEarned(true);
    }

    const xpToStore = isPerfectScore ? totalVideoXp + totalQuizXp : totalVideoXp;
    
    await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: isPerfectScore,
        score: scorePercentage,
        xp_earned: xpToStore,
        completed_at: isPerfectScore ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (isPerfectScore) {
      await awardXp(totalQuizXp);
      toast.success(`Perfect score! +${totalQuizXp} XP earned!`);
    } else {
      toast.info(`Quiz completed! Score: ${scorePercentage}%. Get 100% for +${totalQuizXp} XP!`);
    }
  };

  const handleRetryQuiz = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setCurrentQuestion(0);
    setQuizXpEarned(false);
  };

  const canStartQuiz = videoXpEarned;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Lesson Progress
          </h3>
          <span className="text-sm font-bold text-muted-foreground">
            Total: {totalLessonXp} XP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 rounded-lg border-2 transition-all ${
            videoXpEarned 
              ? "border-green-500 bg-green-500/10" 
              : "border-muted bg-muted/50"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {videoXpEarned ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Play className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs font-semibold">Video</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">+{totalVideoXp} XP</span>
              {videoXpEarned && (
                <span className="text-xs text-green-500 font-semibold">Earned!</span>
              )}
            </div>
          </div>

          <div className={`p-3 rounded-lg border-2 transition-all ${
            quizXpEarned 
              ? "border-green-500 bg-green-500/10" 
              : quizCompleted
              ? "border-yellow-500 bg-yellow-500/10"
              : "border-muted bg-muted/50"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {quizXpEarned ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : quizCompleted ? (
                <Award className="w-4 h-4 text-yellow-500" />
              ) : (
                <Zap className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-xs font-semibold">Quiz</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">+{totalQuizXp} XP</span>
              {quizXpEarned ? (
                <span className="text-xs text-green-500 font-semibold">Perfect!</span>
              ) : quizCompleted ? (
                <span className="text-xs text-yellow-500 font-semibold">{score}%</span>
              ) : (
                <span className="text-xs text-muted-foreground">100% req.</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {!videoXpEarned && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            onClick={handleVideoComplete}
            className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Mark as Watched (+{totalVideoXp} XP)
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Watch the video above and click to earn XP
          </p>
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quiz Time
          </h3>
          {!canStartQuiz && !quizStarted && (
            <span className="text-xs text-muted-foreground">Complete video to unlock</span>
          )}
        </div>

        {canStartQuiz && !quizStarted && !quizCompleted && (
          <Button
            onClick={() => setQuizStarted(true)}
            className="w-full h-12 text-base font-bold"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Quiz
          </Button>
        )}

        {quizCompleted && !quizStarted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg border-2 ${
              quizXpEarned ? "border-green-500 bg-green-500/10" : "border-yellow-500 bg-yellow-500/10"
            }`}
          >
            <div className="text-center">
              {quizXpEarned ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-600">Perfect Score!</p>
                </>
              ) : (
                <>
                  <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                  <p className="font-bold text-yellow-600">Good Effort!</p>
                  <p className="text-sm text-muted-foreground">
                    Score: {score}% - Get 100% for +{totalQuizXp} XP!
                  </p>
                </>
              )}
            </div>
            {!quizXpEarned && (
              <Button onClick={handleRetryQuiz} variant="outline" className="w-full mt-4">
                Try Again
              </Button>
            )}
          </motion.div>
        )}

        {quizStarted && !quizCompleted && (
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    Question {currentQuestion + 1} of {DEFAULT_QUIZ_QUESTIONS.length}
                  </span>
                  <span className="text-muted-foreground">
                    {Object.keys(answers).length}/{DEFAULT_QUIZ_QUESTIONS.length} answered
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((currentQuestion + 1) / DEFAULT_QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-bold text-lg mb-4">
                    {DEFAULT_QUIZ_QUESTIONS[currentQuestion].question}
                  </h4>

                  <div className="space-y-2">
                    {DEFAULT_QUIZ_QUESTIONS[currentQuestion].options.map((option, index) => {
                      const isSelected = answers[currentQuestion] === index;
                      const isCorrect = showResults && index === DEFAULT_QUIZ_QUESTIONS[currentQuestion].correctAnswer;
                      const isWrong = showResults && isSelected && index !== DEFAULT_QUIZ_QUESTIONS[currentQuestion].correctAnswer;

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          disabled={showResults}
                          className={`w-full text-left p-3 rounded-lg text-sm font-semibold transition-all border-2 ${
                            isCorrect
                              ? "border-green-500 bg-green-500/10 text-green-600"
                              : isWrong
                              ? "border-red-500 bg-red-500/10 text-red-600"
                              : isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <span className="inline-block w-6 h-6 rounded-full border-2 mr-2 text-center text-xs leading-5">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  {currentQuestion > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentQuestion < DEFAULT_QUIZ_QUESTIONS.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      disabled={answers[currentQuestion] === undefined}
                      className="flex-1"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(answers).length !== DEFAULT_QUIZ_QUESTIONS.length}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {videoXpEarned && quizXpEarned && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-yellow-500/20 border-2 border-green-500/30 text-center"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-2xl font-bold mb-2">Lesson Complete!</h3>
          <p className="text-muted-foreground mb-4">
            You've earned all {totalLessonXp} XP from this lesson!
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Video: +{totalVideoXp} XP
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Quiz: +{totalQuizXp} XP
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
