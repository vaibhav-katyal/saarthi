import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import KnowledgeVault from "@/pages/KnowledgeVault";
import Roadmap from "@/pages/Roadmap";
import MCQ from "@/pages/MCQ";
import Testpad from "@/pages/Testpad";
import Community from "@/pages/Community";
import LeaveManager from "@/pages/LeaveManager";
import CodeDuel from "@/pages/CodeDuel";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  // Root path: show dashboard if logged in, landing if not
  if (location.pathname === "/") {
    if (loading) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <AppSidebar />
          <Dashboard />
        </div>
      );
    }

    return <Landing />;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vault" element={<KnowledgeVault />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/mcq" element={<MCQ />} />
          <Route path="/testpad" element={<Testpad />} />
          <Route path="/community" element={<Community />} />
          <Route path="/duel" element={<CodeDuel />} />
          <Route path="/leave" element={<LeaveManager />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
