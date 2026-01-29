import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import ModuleContent from "./pages/ModuleContent";
import Module2Content from "./pages/Module2Content";
import Scenarios from "./pages/Scenarios";
import Training from "./pages/Training";
import VoiceTraining from "./pages/VoiceTraining";
import Results from "./pages/Results";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import { CrashReporter } from "@/components/debug/CrashReporter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CrashReporter />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/vehicle-selection-fundamentals" element={<ModuleContent />} />
            <Route path="/learn/trade-appraisal-process" element={<Module2Content />} />
            <Route path="/learn/:moduleId" element={<ModuleContent />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/training/:scenarioId" element={<Training />} />
            <Route path="/voice-training" element={<VoiceTraining />} />
            <Route path="/results" element={<Results />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/team" element={<Team />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
