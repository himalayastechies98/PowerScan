import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Distribution from "./pages/Distribution";
import UploadMeasures from "./pages/UploadMeasures";
import Feeders from "./pages/Feeders";
import AdminClients from "./pages/AdminClients";
import ClientInspections from "./pages/ClientInspections";
import Profile from "./pages/Profile";
import Elements from "./pages/system/Elements";
import Lamps from "./pages/system/Lamps";
import Cars from "./pages/system/Cars";
import Actions from "./pages/system/Actions";
import Methods from "./pages/system/Methods";
import Alarms from "./pages/system/Alarms";
import MeasureDetails from "./pages/MeasureDetails";
import MeasureImageDetails from "./pages/MeasureImageDetails";
import InspectionMeasures from "./pages/InspectionMeasures";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Admin Dashboard - Admin only */}
            <Route path="/" element={<AdminRoute><Index /></AdminRoute>} />
            {/* Admin pages - Admin only */}
            <Route path="/distribution" element={<AdminRoute><Distribution /></AdminRoute>} />
            <Route path="/distribution/measure/:id" element={<AdminRoute><InspectionMeasures /></AdminRoute>} />
            <Route path="/distribution/measures/:id" element={<AdminRoute><MeasureDetails /></AdminRoute>} />
            <Route path="/measure-image/:id" element={<AdminRoute><MeasureImageDetails /></AdminRoute>} />
            <Route path="/upload" element={<AdminRoute><UploadMeasures /></AdminRoute>} />
            <Route path="/upload/:inspectionId" element={<AdminRoute><UploadMeasures /></AdminRoute>} />
            <Route path="/feeders" element={<AdminRoute><Feeders /></AdminRoute>} />
            <Route path="/clients" element={<AdminRoute><AdminClients /></AdminRoute>} />
            {/* Client Dashboard - Available to all authenticated users */}
            <Route path="/inspections" element={<ProtectedRoute><ClientInspections /></ProtectedRoute>} />
            {/* Profile - Available to all authenticated users */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* System pages - Admin only */}
            <Route path="/system/elements" element={<AdminRoute><Elements /></AdminRoute>} />
            <Route path="/system/lamps" element={<AdminRoute><Lamps /></AdminRoute>} />
            <Route path="/system/cars" element={<AdminRoute><Cars /></AdminRoute>} />
            <Route path="/system/actions" element={<AdminRoute><Actions /></AdminRoute>} />
            <Route path="/system/methods" element={<AdminRoute><Methods /></AdminRoute>} />
            <Route path="/system/alarms" element={<AdminRoute><Alarms /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
