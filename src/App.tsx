import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ModelDetail from "./pages/ModelDetail.tsx";
import Stats from "./pages/Stats.tsx";
import Review from "./pages/Review.tsx";
import Contact from "./pages/Contact.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import RequireAdmin from "./components/RequireAdmin.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/modelo/:slug" element={<ModelDetail />} />
          <Route path="/acceso" element={<Auth />} />
          <Route path="/resena" element={<Review />} />
          <Route path="/contacto" element={<Contact />} />
          <Route
            path="/estadisticas"
            element={
              <RequireAdmin>
                <Stats />
              </RequireAdmin>
            }
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
