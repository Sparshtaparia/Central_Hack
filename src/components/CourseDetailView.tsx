import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import ModuleCard from "./ModuleCard";
import LevelBadge from "./LevelBadge";

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: any[];
}

interface CourseDetailViewProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

export default function CourseDetailView({
  courseId,
  courseName,
  onBack,
}: CourseDetailViewProps) {
  const { user, profile } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      if (!user) return;

      // Fetch units and lessons
      const { data: unitsData } = await supabase
        .from("units")
        .select("*")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });

      if (unitsData) {
        // Fetch lessons for each unit
        const unitsWithLessons = await Promise.all(
          unitsData.map(async (unit) => {
            const { data: lessonsData } = await supabase
              .from("lessons")
              .select("*")
              .eq("unit_id", unit.id)
              .order("sort_order", { ascending: true });

            return {
              ...unit,
              lessons: lessonsData || [],
            };
          })
        );

        setModules(unitsWithLessons);
      }

      // Fetch user progress for all lessons in this course
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("lesson_id, completed, score, xp_earned")
        .eq("user_id", user.id);

      if (progressData) {
        const progressMap = progressData.reduce(
          (acc, p) => {
            acc[p.lesson_id] = p;
            return acc;
          },
          {} as Record<string, any>
        );
        setUserProgress(progressMap);
      }

      setLoading(false);
    };

    loadCourseData();
  }, [courseId, user]);

  // Calculate XP for next level
  const currentLevel = profile?.level || 1;
  const currentXp = profile?.xp || 0;
  const xpToNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXp % xpToNextLevel;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>
        <h2 className="text-3xl font-bold mb-2">{courseName}</h2>
        <p className="text-muted-foreground">
          Complete modules and lessons to earn XP and level up
        </p>
      </div>

      {/* Level Badge */}
      <LevelBadge
        level={currentLevel}
        xp={xpInCurrentLevel}
        xpToNextLevel={xpToNextLevel}
      />

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((module, idx) => (
          <ModuleCard
            key={module.id}
            id={module.id}
            title={module.title}
            moduleIndex={idx}
            lessons={module.lessons}
            userProgress={userProgress}
          />
        ))}
      </div>
    </motion.div>
  );
}
