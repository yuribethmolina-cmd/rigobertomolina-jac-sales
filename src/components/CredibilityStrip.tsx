import { Trophy, CreditCard, MapPin } from "lucide-react";

const items = [
  { icon: Trophy, text: "Vendiendo la marca #1 en Venezuela 2025" },
  { icon: CreditCard, text: "Compra directa · Financiamiento disponible" },
  { icon: MapPin, text: "Atención personalizada · Caracas, Venezuela" },
];

const CredibilityStrip = () => (
  <section className="bg-primary py-4">
    <div className="container flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
      {items.map((item) => (
        <div key={item.text} className="flex items-center gap-2 text-primary-foreground text-sm font-semibold">
          <item.icon size={18} />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  </section>
);

export default CredibilityStrip;
