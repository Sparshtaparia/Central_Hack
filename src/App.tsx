import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Academy from "./pages/Academy";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";
import Leaderboard from "./pages/Leaderboard";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import AppLayout from "./components/AppLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicOnly><Index /></PublicOnly>} />
            <Route path="/auth" element={<PublicOnly><Auth /></PublicOnly>} />

            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="academy" element={<Academy />} />
              <Route path="course/:courseId" element={<CoursePage />} />
              <Route path="lesson/:lessonId" element={<LessonPage />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="courses/:courseId/lessons" element={<AdminLessons />} />
              <Route path="rewards" element={<AdminRewards />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
