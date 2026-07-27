import { Trophy, CreditCard, MapPin } from "lucide-react";

const items = [
  { icon: Trophy, text: "VENDIENDO LA MARCA #1 EN VENEZUELA" },
  { icon: CreditCard, text: "Compra directa · Financiamiento disponible" },
  { icon: MapPin, text: "Atención personalizada · Caracas, Venezuela" },
];

const CredibilityStrip = () => (
  <section className="bg-gradient-to-r from-primary via-[hsl(186,100%,43%)] to-primary py-5 shadow-inner">
    <div className="container flex flex-col md:flex-row items-center justify-center gap-5 md:gap-0 md:divide-x md:divide-white/20">
      {items.map((item) => (
        <div
          key={item.text}
          className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-primary-foreground md:px-8"
        >
          <span className="bg-white/20 rounded-full p-2">
            <item.icon size={28} />
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-center md:text-left">
            {item.text}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default CredibilityStrip;
