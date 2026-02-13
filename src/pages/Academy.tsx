import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import CourseCard from "@/components/CourseCard";
import CourseDetailView from "@/components/CourseDetailView";
import LevelBadge from "@/components/LevelBadge";
import { motion } from "framer-motion";
import { Search, Filter, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Personal Finance", "Corporate Finance", "Economics", "Trading", "Investing", "Stock Market"];

export default function Academy() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching courses:", error);
        }
        setCourses(data || []);
      });
  }, []);

  // Load course progress for user
  useEffect(() => {
    if (!user || courses.length === 0) return;

    const loadProgress = async () => {
      // Fetch all units and lessons
      const { data: unitsData } = await supabase
        .from("units")
        .select("id, course_id");

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id, unit_id");

      // Fetch user progress for those lessons
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id);

      if (progressData && lessonsData && unitsData) {
        const progressMap: Record<string, any> = {};

        // Calculate progress per course
        courses.forEach((course: any) => {
          const courseUnits = unitsData.filter(
            (m: any) => m.course_id === course.id
          ) || [];
          const courseLessons = lessonsData.filter((l: any) =>
            courseUnits.some((m: any) => m.id === l.unit_id)
          );

          const completedCount = progressData.filter((p: any) =>
            courseLessons.some((l: any) => l.id === p.lesson_id && p.completed)
          ).length;

          progressMap[course.id] = {
            completed: completedCount,
            total: courseLessons.length,
            percentage: courseLessons.length > 0
              ? Math.round((completedCount / courseLessons.length) * 100)
              : 0,
          };
        });

        setCourseProgress(progressMap);
      }
    };

    loadProgress();
  }, [user, courses]);

  // Calculate XP for next level
  const currentLevel = profile?.level || 1;
  const currentXp = profile?.xp || 0;
  const xpToNextLevel = currentLevel * 100;
  const xpInCurrentLevel = currentXp % xpToNextLevel;
  const streak = profile?.streak || 0;

  const filtered = courses.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  // If a course is selected, show the detail view
  if (selectedCourse) {
    return (
      <div className="max-w-6xl mx-auto">
        <CourseDetailView
          courseId={selectedCourse.id}
          courseName={selectedCourse.title}
          onBack={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  // Otherwise show course list with progress
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with Level Badge */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Academy</h1>
        <p className="text-lg text-muted-foreground">
          Master your finances, one lesson at a time
        </p>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <LevelBadge
            level={currentLevel}
            xp={xpInCurrentLevel}
            xpToNextLevel={xpToNextLevel}
          />

          {/* Streak */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-orange-500/5 p-4 rounded-xl border border-orange-500/20"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-lg">
                {streak}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Streak</p>
                <p className="text-sm font-bold">Keep it going!</p>
              </div>
              <Flame className="w-5 h-5 text-orange-500 ml-auto" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filtered.map((course: any, i: number) => {
          const progress = courseProgress[course.id] || {
            completed: 0,
            total: 0,
            percentage: 0,
          };

          return (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedCourse(course)}
              className="cursor-pointer"
            >
              <CourseCard
                id={course.id}
                title={course.title}
                category={course.category}
                icon={course.icon || "📚"}
                color={course.color}
                lessonsCount={progress.total}
                progress={progress.percentage}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No courses found</p>
        </div>
      )}
    </div>
  );
}
