import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Compiler from "./pages/Compiler";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AdminPortal from "./pages/AdminPortal";
import History from './pages/history';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - Test Attendee */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="testAttendee">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compiler/:testId"
              element={
                <ProtectedRoute requiredRole="testAttendee">
                  <Compiler />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole="testAttendee">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Admin Only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPortal />
                </ProtectedRoute>
              }
            />
            <Route 
  path="/history" 
  element={
    <ProtectedRoute requiredRole="testAttendee">
      <History onNavigate={function (path: string): void {
        throw new Error("Function not implemented.");
      } } />
    </ProtectedRoute>
  } 
/>
            {/* Catch all - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;