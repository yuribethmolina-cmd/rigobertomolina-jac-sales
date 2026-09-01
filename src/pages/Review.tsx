import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { vehicles } from "@/data/vehicles";
import { getPlan } from "@/data/financingPlans";
import { toast } from "sonner";
import { Star, Send, CheckCircle2, Camera, X, ArrowLeft, BadgeCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const compressPhoto = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 900;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });

const Review = () => {
  const [searchParams] = useSearchParams();
  const presetVehicle = vehicles.find((v) => v.id === searchParams.get("modelo"));
  const presetPlan = searchParams.get("plan") ? getPlan(searchParams.get("plan")!) : undefined;

  const [customerName, setCustomerName] = useState("");
  const [vehicleName, setVehicleName] = useState(presetVehicle?.displayName ?? "");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setPhoto(await compressPhoto(file));
    } catch {
      toast.error("No se pudo leer la imagen. Prueba con otra.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !message.trim() || rating === 0) {
      toast.error("Completa tu nombre, calificación y reseña.");
      return;
    }
    setSending(true);
    const finalMessage = presetPlan
      ? `Compré con ${presetPlan.name}. ${message.trim()}`
      : message.trim();
    const { data: inserted, error } = await supabase.from("reviews").insert({
      customer_name: customerName.trim(),
      vehicle_name: vehicleName || null,
      rating,
      message: finalMessage,
      photo_url: photo,
    }).select("id").single();
    setSending(false);
    if (error) {
      toast.error("No se pudo enviar la reseña. Intenta de nuevo.");
      return;
    }
    setDone(true);
    if (inserted?.id) {
      supabase.functions
        .invoke("send-review-email", { body: { reviewId: inserted.id } })
        .catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <Helmet>
        <title>Deja tu reseña · Rigoberto Molina JAC</title>
        <meta name="description" content="Cuéntanos tu experiencia con la compra de tu JAC. Tu opinión ayuda a otros clientes." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-[hsl(212,52%,13%)] p-6 md:p-8 relative">
        <Link
          to="/"
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Inicio
        </Link>
        {done ? (
          <div className="text-center py-8 pt-10">
            <CheckCircle2 className="mx-auto text-primary" size={48} />
            <h1 className="mt-4 font-heading text-2xl font-bold uppercase text-foreground">
              ¡Gracias por tu reseña!
            </h1>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Tu opinión es muy importante para nosotros y para futuros compradores.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft size={16} /> Volver al inicio
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold uppercase text-foreground text-center">
              ¿Cómo fue tu experiencia?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Cuéntanos cómo te fue con la compra de tu JAC
            </p>
            {(presetVehicle || presetPlan) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {presetVehicle && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                    <BadgeCheck size={13} /> {presetVehicle.displayName}
                  </span>
                )}
                {presetPlan && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                    <BadgeCheck size={13} /> {presetPlan.name}
                  </span>
                )}
              </div>
            )}

            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={80}
                  className="w-full rounded-lg border border-primary/25 bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Nombre y apellido"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Modelo que compraste (opcional)
                </label>
                <select
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  className="w-full rounded-lg border border-primary/25 bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Selecciona tu modelo</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.displayName}>
                      {v.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Calificación
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={
                          n <= (hovered || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Tu reseña
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={600}
                  rows={4}
                  className="w-full rounded-lg border border-primary/25 bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary resize-none"
                  placeholder="¿Cómo te atendieron? ¿Recomendarías comprar aquí?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Foto de tu JAC (opcional)
                </label>
                {photo ? (
                  <div className="relative inline-block">
                    <img
                      src={photo}
                      alt="Foto adjunta a la reseña"
                      className="h-28 rounded-lg border border-primary/25 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      aria-label="Quitar foto"
                      className="absolute -top-2 -right-2 rounded-full bg-background border border-primary/40 p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary/40 px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                    <Camera size={16} />
                    Adjuntar foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary h-11 px-4 font-heading text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                <Send size={15} />
                {sending ? "Enviando..." : "Enviar reseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Review;
