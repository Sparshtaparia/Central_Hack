// src/components/AppLayout.tsx
import { Outlet } from "react-router-dom";
import AIChatbot from "./AIChatbot";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen pb-16">
      {/* Main content */}
      <div className="p-4">
        <Outlet /> {/* This renders nested routes */}
      </div>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Floating chatbot */}
      <AIChatbot />
    </div>
  );
};

export default AppLayout;
