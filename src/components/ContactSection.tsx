import { useState } from "react";
import { MessageCircle, Phone, Mail, ArrowRight } from "lucide-react";
import { waLink, WHATSAPP_DISPLAY, EMAIL } from "@/lib/constants";

const modelOptions = [
  "--- Comerciales ---",
  "X100 Ferretero", "Urban Ferretero 3 Ton", "Urban Chasis Largo 3 Ton",
  "Sunray V6", "M4 Carroza",
  "--- Camiones ---",
  "6T Chasis 6 Ton", "6T Ferretero 6 Ton",
  "Búfalo 12 Ton", "Búfalo XL 13 Ton",
  "Leyenda 20 Ton", "Cavalino 22 Ton",
  "Chuto 400HP 40 Ton", "K5 Chuto 430HP 45 Ton",
  "--- Pickups ---",
  "La Venezolana 4x2", "La Venezolana 4x2 Diesel", "La Venezolana 4x4 Diesel",
  "La Venezolana PRO 4x4",
  "Doble Cabina", "C-3500 4x4",
  "Aventura", "Aventura Pro",
  "--- SUVs ---",
  "Nevado MT", "Nevado AT",
  "Arena Sport MT", "Arena Sport AT", "Arena Pro",
  "Tepuy Pro", "Savanna",
  "Otro",
];

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", phone: "", model: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hola Rigoberto, soy ${form.name}. Me interesa el ${form.model}. ${form.message}. Mi teléfono: ${form.phone}`;
    window.open(waLink(msg), "_blank");
  };

  return (
    <section id="contacto" className="py-20 md:py-28 bg-secondary/30">
      <div className="container">
        <div className="text-center">
          <h2 className="section-title">Hablemos</h2>
          <p className="section-subtitle">Estoy en Caracas, atiendo de lunes a sábado</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Contact cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="card-glow p-6 text-center group">
            <MessageCircle className="mx-auto text-whatsapp" size={28} />
            <p className="font-heading font-bold mt-3">WhatsApp</p>
            <p className="text-muted-foreground text-sm mt-1">{WHATSAPP_DISPLAY}</p>
            <span className="inline-block mt-3 text-sm font-semibold text-primary group-hover:underline">Escribir ahora</span>
          </a>
          <a href={`tel:${WHATSAPP_DISPLAY.replace(/\s/g, "")}`} className="card-glow p-6 text-center group">
            <Phone className="mx-auto text-primary" size={28} />
            <p className="font-heading font-bold mt-3">Teléfono</p>
            <p className="text-muted-foreground text-sm mt-1">{WHATSAPP_DISPLAY}</p>
            <span className="inline-block mt-3 text-sm font-semibold text-primary group-hover:underline">Llamar</span>
          </a>
          <a href={`mailto:${EMAIL}`} className="card-glow p-6 text-center group">
            <Mail className="mx-auto text-primary" size={28} />
            <p className="font-heading font-bold mt-3">Correo</p>
            <p className="text-muted-foreground text-sm mt-1">{EMAIL}</p>
            <span className="inline-block mt-3 text-sm font-semibold text-primary group-hover:underline">Enviar correo</span>
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-12 card-glow p-6 md:p-8 max-w-2xl mx-auto space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Nombre completo</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Teléfono / WhatsApp</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Modelo de interés</label>
            <select
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona un modelo</option>
              {modelOptions.map((m) =>
                m.startsWith("---") ? (
                  <option key={m} disabled className="font-bold">{m.replace(/---/g, "").trim()}</option>
                ) : (
                  <option key={m} value={m}>{m}</option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Mensaje</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-colors"
          >
            Enviar consulta <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
