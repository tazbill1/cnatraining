import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import ModuleContent from "./pages/ModuleContent";
import Module2Content from "./pages/Module2Content";
import Module3Content from "./pages/Module3Content";
import Module4Content from "./pages/Module4Content";
import BaseStatementContent from "./pages/BaseStatementContent";
import Toolbox from "./pages/Toolbox";
import CNAForm from "./pages/CNAForm";
import PhoneScripts from "./pages/PhoneScripts";
import ConsultativeCallGuide from "./pages/ConsultativeCallGuide";
import Scenarios from "./pages/Scenarios";
import Training from "./pages/Training";
import VoiceTraining from "./pages/VoiceTraining";
import Results from "./pages/Results";
import SessionHistory from "./pages/SessionHistory";
import Progress from "./pages/Progress";
import Performance from "./pages/Performance";
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
            <Route path="/learn/base-statement" element={<BaseStatementContent />} />
            <Route path="/learn/vehicle-selection-fundamentals" element={<ModuleContent />} />
            <Route path="/learn/trade-appraisal-process" element={<Module2Content />} />
            <Route path="/learn/objection-handling-framework" element={<Module3Content />} />
            <Route path="/learn/phone-sales-fundamentals" element={<Module4Content />} />
            <Route path="/learn/:moduleId" element={<ModuleContent />} />
            <Route path="/toolbox" element={<Toolbox />} />
            <Route path="/toolbox/cna-form" element={<CNAForm />} />
            <Route path="/toolbox/phone-scripts" element={<PhoneScripts />} />
            <Route path="/toolbox/consultative-call-guide" element={<ConsultativeCallGuide />} />
            <Route path="/cna-form" element={<Navigate to="/toolbox/cna-form" replace />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/training/:scenarioId" element={<Training />} />
            <Route path="/voice-training" element={<VoiceTraining />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<SessionHistory />} />
            <Route path="/history/:sessionId" element={<SessionHistory />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/performance" element={<Performance />} />
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
