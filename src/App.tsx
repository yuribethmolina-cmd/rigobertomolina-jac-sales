import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ModelDetail from "./pages/ModelDetail.tsx";
import Stats from "./pages/Stats.tsx";
import Review from "./pages/Review.tsx";
import ModerateReviews from "./pages/ModerateReviews.tsx";
import Contact from "./pages/Contact.tsx";
import Auth from "./pages/Auth.tsx";
import DigitalCard from "./pages/DigitalCard.tsx";
import Financiamiento from "./pages/Financiamiento.tsx";
import PlanesFinanciamiento from "./pages/PlanesFinanciamiento.tsx";
import Creditos from "./pages/Creditos.tsx";
import EnviarDocumentos from "./pages/EnviarDocumentos.tsx";
import Asesor from "./pages/Asesor.tsx";
import AdvisorLauncher from "./components/advisor/AdvisorLauncher.tsx";
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
          <Route
            path="/resenas/moderar"
            element={
              <RequireAdmin>
                <ModerateReviews />
              </RequireAdmin>
            }
          />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/tarjeta" element={<DigitalCard />} />
          <Route path="/financiamiento" element={<Financiamiento />} />
          <Route path="/financiamiento/planes" element={<PlanesFinanciamiento />} />
          <Route path="/creditos" element={<Creditos />} />
          <Route path="/enviar-documentos" element={<EnviarDocumentos />} />
          <Route
            path="/estadisticas"
            element={
              <RequireAdmin>
                <Stats />
              </RequireAdmin>
            }
          />

          <Route path="/asesor" element={<Asesor />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AdvisorLauncher />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
