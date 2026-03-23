import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DealershipProvider } from "@/hooks/useDealershipContext";
import { CrashReporter } from "@/components/debug/CrashReporter";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const ModuleContent = lazy(() => import("./pages/ModuleContent"));
const Module2Content = lazy(() => import("./pages/Module2Content"));
const Module3Content = lazy(() => import("./pages/Module3Content"));
const Module4Content = lazy(() => import("./pages/Module4Content"));
const BuyerTypesContent = lazy(() => import("./pages/BuyerTypesContent"));
const BuyerTypesVideo = lazy(() => import("./pages/BuyerTypesVideo"));
const BaseStatementContent = lazy(() => import("./pages/BaseStatementContent"));
const DealershipModuleContent = lazy(() => import("./pages/DealershipModuleContent"));
const Toolbox = lazy(() => import("./pages/Toolbox"));
const CNAForm = lazy(() => import("./pages/CNAForm"));
const PhoneScripts = lazy(() => import("./pages/PhoneScripts"));
const ConsultativeCallGuide = lazy(() => import("./pages/ConsultativeCallGuide"));
const Scenarios = lazy(() => import("./pages/Scenarios"));
const Training = lazy(() => import("./pages/Training"));
const VoiceTraining = lazy(() => import("./pages/VoiceTraining"));
const Results = lazy(() => import("./pages/Results"));
const SessionHistory = lazy(() => import("./pages/SessionHistory"));
const Progress = lazy(() => import("./pages/Progress"));
const Settings = lazy(() => import("./pages/Settings"));
const Team = lazy(() => import("./pages/Team"));
const Admin = lazy(() => import("./pages/Admin"));
const Certificates = lazy(() => import("./pages/Certificates"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CrashReporter />
      <BrowserRouter>
        <AuthProvider>
          <DealershipProvider>
            <Suspense fallback={<LoadingScreen />}>
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
                <Route path="/learn/buyer-types" element={<BuyerTypesContent />} />
                <Route path="/learn/base-statement-video" element={<BuyerTypesVideo />} />
                <Route path="/learn/dealership/:moduleId" element={<DealershipModuleContent />} />
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
                <Route path="/performance" element={<Navigate to="/dashboard" replace />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/team" element={<Team />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </DealershipProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
