import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { useAccessibility } from "@/hooks/useAccessibility";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuraAssistant } from "./components/aura/AuraAssistant";
import { PageTransition } from "./components/layout/PageTransition";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";
import { ParallaxPerfOverlay } from "./components/dev/ParallaxPerfOverlay";

// Lazy-loaded routes for faster initial load
const Library = lazy(() => import("./pages/Library"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Builder = lazy(() => import("./pages/Builder"));
const Community = lazy(() => import("./pages/Community"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const Collaboration = lazy(() => import("./pages/Collaboration"));
const Videos = lazy(() => import("./pages/Videos"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Admin = lazy(() => import("./pages/Admin"));
const GeniusBar = lazy(() => import("./pages/GeniusBar"));
const SeparationOfMixtures = lazy(() => import("./pages/SeparationOfMixtures"));
const SeparationExperiment = lazy(() => import("./pages/SeparationExperiment"));
const AcidsBasesIndicators = lazy(() => import("./pages/AcidsBasesIndicators"));
const AcidBaseExperiment = lazy(() => import("./pages/AcidBaseExperiment"));
const ExcretorySystem = lazy(() => import("./pages/ExcretorySystem"));
const ExcretoryExperiment = lazy(() => import("./pages/ExcretoryExperiment"));
const ForceAndEnergy = lazy(() => import("./pages/ForceAndEnergy"));
const ForceEnergyExperiment = lazy(() => import("./pages/ForceEnergyExperiment"));
const ReproductiveSystem = lazy(() => import("./pages/ReproductiveSystem"));
const ReproductiveExperiment = lazy(() => import("./pages/ReproductiveExperiment"));

function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useAccessibility();
  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PageTransition>
                <Suspense fallback={null}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/workspace" element={<Workspace />} />
                    <Route path="/workspace/:experimentId" element={<Workspace />} />
                    <Route path="/builder" element={<Builder />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/collaboration/:roomId" element={<Collaboration />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/genius-bar" element={<GeniusBar />} />
                    <Route path="/separation-of-mixtures" element={<SeparationOfMixtures />} />
                    <Route path="/separation-of-mixtures/:experimentId" element={<SeparationExperiment />} />
                    <Route path="/acids-bases-indicators" element={<AcidsBasesIndicators />} />
                    <Route path="/acids-bases-indicators/:experimentId" element={<AcidBaseExperiment />} />
                    <Route path="/excretory-system" element={<ExcretorySystem />} />
                    <Route path="/excretory-system/:experimentId" element={<ExcretoryExperiment />} />
                    <Route path="/force-and-energy" element={<ForceAndEnergy />} />
                    <Route path="/force-and-energy/:experimentId" element={<ForceEnergyExperiment />} />
                    <Route path="/reproductive-system" element={<ReproductiveSystem />} />
                    <Route path="/reproductive-system/:experimentId" element={<ReproductiveExperiment />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </PageTransition>
              <OnboardingTour />
              <AuraAssistant />
              <ParallaxPerfOverlay />
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
