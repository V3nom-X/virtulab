import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Library from "./pages/Library";
import Workspace from "./pages/Workspace";
import Builder from "./pages/Builder";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import Collaboration from "./pages/Collaboration";
import Videos from "./pages/Videos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
