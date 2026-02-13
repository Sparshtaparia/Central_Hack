import { Home, BookOpen, Trophy, Gift, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/app" },
  { icon: BookOpen, label: "Learn", path: "/app/academy" },
  { icon: Trophy, label: "Rank", path: "/app/leaderboard" },
  { icon: Gift, label: "Rewards", path: "/app/rewards" },
  { icon: User, label: "Profile", path: "/app/profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/app" && pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                />
              )}
              <item.icon
                className={`w-6 h-6 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
