import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/HeroSection";
import CredibilityStrip from "@/components/CredibilityStrip";
import ModelsSection from "@/components/ModelsSection";
import ComparisonSection from "@/components/ComparisonSection";
import PurchasePlansSection from "@/components/PurchasePlansSection";
import MorePlansSection from "@/components/MorePlansSection";
import PlanComparator from "@/components/PlanComparator";
import PaymentSection from "@/components/PaymentSection";
import PaymentSimulator from "@/components/PaymentSimulator";
import GuidedSimulator from "@/components/GuidedSimulator";
import QuickQuoteSection from "@/components/QuickQuoteSection";
import HowToBuySection from "@/components/HowToBuySection";
import FAQSection from "@/components/FAQSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => (
  <>
    <Helmet>
      <title>Rigoberto Molina · Vendedor JAC Caracas</title>
      <meta
        name="description"
        content="Catálogo JAC Venezuela · Compra Directa · Atención personalizada en Caracas. SUVs, camionetas y comerciales."
      />
      <link rel="canonical" href="https://rigobertomolina.com/" />
      <meta property="og:url" content="https://rigobertomolina.com/" />
    </Helmet>
    <HeroSection />
    <CredibilityStrip />
    <ModelsSection />
    <ComparisonSection />
    <PurchasePlansSection />
    <MorePlansSection />
    <PlanComparator />
    <PaymentSection />
    <PaymentSimulator />
    <GuidedSimulator />
    <QuickQuoteSection />
    <HowToBuySection />
    <FAQSection />
    <AboutSection />
    <ContactSection />
    <FooterSection />
    <WhatsAppFloat />
  </>
);

export default Index;
