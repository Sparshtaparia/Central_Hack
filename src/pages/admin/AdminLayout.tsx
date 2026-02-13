import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import {
  LayoutDashboard, BookOpen, Award, FileText, Users, Bell, ArrowLeft
} from "lucide-react";

const adminNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: BookOpen, label: "Courses", path: "/admin/courses" },
  { icon: Award, label: "Rewards", path: "/admin/rewards" },
  { icon: FileText, label: "Articles", path: "/admin/articles" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate("/app");
  }, [isAdmin, loading, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg font-extrabold text-foreground">Admin Panel</h1>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        <nav className="hidden md:block w-56 shrink-0 border-r border-border p-4 space-y-1 sticky top-14 h-[calc(100vh-3.5rem)]">
          {adminNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                pathname === item.path || pathname.startsWith(item.path + "/") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
          <div className="flex justify-around py-2">
            {adminNav.slice(0, 6).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1 px-1.5 ${
                  pathname === item.path || pathname.startsWith(item.path + "/") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[8px] font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
