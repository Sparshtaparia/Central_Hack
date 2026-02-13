import { motion } from "framer-motion";
import { ChevronRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  lessonsCount?: number;
  progress?: number;
}

export default function CourseCard({ id, title, category, icon, color, lessonsCount = 0, progress = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={`/app/course/${id}`}
        className="block rounded-2xl p-4 border-2 border-border bg-card hover:shadow-warm transition-shadow"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: color + "20" }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</p>
            <h3 className="font-bold text-foreground truncate">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{lessonsCount} lessons</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
        {progress > 0 && (
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-warm"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
}
