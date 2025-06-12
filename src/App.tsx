import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { PrivateRoute } from '@/components/PrivateRoute'
import { Landing } from '@/components/Landing'
import { Auth } from '@/components/Auth'
import { Dashboard } from '@/components/Dashboard'
import { TeamHealth } from '@/components/TeamHealth'
import { AssignmentManagement } from '@/components/AssignmentManagement'
import { TeamManagement } from '@/components/TeamManagement'
import { SubmissionTracking } from '@/components/SubmissionTracking'
import { PeerGrading } from '@/components/PeerGrading'
import { StudentSubmission } from '@/components/StudentSubmission'
import { Analytics } from '@/components/Analytics'
import { Profile } from '@/components/Profile'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FeedbackForm } from '@/components/FeedbackForm'
import {NotFound} from './pages/NotFound'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <div className="min-h-screen bg-background">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<Auth />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <PrivateRoute>
                        <TeamHealth />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/assignments"
                    element={
                      <PrivateRoute>
                        <AssignmentManagement />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/teams"
                    element={
                      <PrivateRoute>
                        <TeamManagement />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/submissions"
                    element={
                      <PrivateRoute>
                        <SubmissionTracking />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/peer-grading"
                    element={
                      <PrivateRoute>
                        <PeerGrading />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/student-submission"
                    element={
                      <PrivateRoute>
                        <StudentSubmission />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute>
                        <Analytics />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/feedback"
                    element={
                      <PrivateRoute>
                        <FeedbackForm />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
