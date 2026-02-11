import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Resources from "./pages/Resources";
import Roadmaps from "./pages/Roadmaps";
import Testpad from "./pages/Testpad";
import Community from "./pages/Community";
import LeaveManager from "./pages/LeaveManager";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/roadmaps" element={<Roadmaps />} />
              <Route path="/testpad" element={<Testpad />} />
              <Route path="/community" element={<Community />} />
              <Route path="/leaves" element={<LeaveManager />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
