import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CourseCard from "@/components/CourseCard";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Personal Finance", "Corporate Finance", "Economics", "Trading", "Investing", "Stock Market"];

export default function Academy() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    supabase.from("courses").select("*").eq("is_published", true).order("sort_order").then(({ data }) => {
      setCourses(data || []);
    });
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-extrabold text-foreground mb-1">Academy</h1>
        <p className="text-sm text-muted-foreground mb-4">Master your finances, one lesson at a time</p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
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

        {/* Courses */}
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CourseCard
                id={c.id}
                title={c.title}
                category={c.category}
                icon={c.icon}
                color={c.color}
              />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No courses found</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
