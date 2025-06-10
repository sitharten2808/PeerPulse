import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Landing from "@/components/Landing";
import Auth from "@/components/Auth";
import Dashboard from "@/components/Dashboard";
import FeedbackForm from "@/components/FeedbackForm";
import TeamHealth from "@/components/TeamHealth";
import AssignmentManagement from "@/components/AssignmentManagement";
import TeamManagement from "@/components/TeamManagement";
import SubmissionTracking from "@/components/SubmissionTracking";
import PeerGrading from "@/components/PeerGrading";
import StudentSubmission from "@/components/StudentSubmission";
import Analytics from "@/components/Analytics";
import Profile from "@/components/Profile";
import PrivateRoute from "@/components/PrivateRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/feedback" element={
                  <PrivateRoute>
                    <FeedbackForm />
                  </PrivateRoute>
                } />
                <Route path="/team" element={
                  <PrivateRoute>
                    <TeamHealth />
                  </PrivateRoute>
                } />
                <Route path="/assignments" element={
                  <PrivateRoute>
                    <AssignmentManagement />
                  </PrivateRoute>
                } />
                <Route path="/team-management" element={
                  <PrivateRoute>
                    <TeamManagement />
                  </PrivateRoute>
                } />
                <Route path="/submissions" element={
                  <PrivateRoute>
                    <SubmissionTracking />
                  </PrivateRoute>
                } />
                <Route path="/peer-grading" element={
                  <PrivateRoute>
                    <PeerGrading />
                  </PrivateRoute>
                } />
                <Route path="/my-assignments" element={
                  <PrivateRoute>
                    <StudentSubmission />
                  </PrivateRoute>
                } />
                <Route path="/analytics" element={
                  <PrivateRoute>
                    <Analytics />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
