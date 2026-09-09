import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MessageCircle, UserPlus } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import AdvisorModelCard from "@/components/advisor/AdvisorModelCard";
import AdvisorCompare from "@/components/advisor/AdvisorCompare";
import AdvisorLeadForm, { buildWhatsAppMessage } from "@/components/advisor/AdvisorLeadForm";
import { supabase } from "@/integrations/supabase/client";
import { waLink } from "@/lib/constants";
import { trackContact } from "@/lib/track";
import { toast } from "@/hooks/use-toast";
import { detectVehicles } from "@/lib/advisorMatch";
import type { Vehicle } from "@/data/vehicles";
import asesorAvatar from "@/assets/asesor-avatar.png";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const FIRST_MESSAGE =
  "Hola. Soy el asistente de Rigoberto Molina. Puedo ayudarte a encontrar un JAC según lo que necesitas, comparar modelos o entender las opciones de compra. ¿Qué estás buscando?";

const QUICK_START = [
  "Busco un carro familiar",
  "Quiero una pickup",
  "Busco algo económico",
  "Quiero financiar",
  "Quiero comparar modelos",
  "Ya sé qué JAC quiero",
];

/** Respuestas rápidas por etapa. El asesor pregunta una cosa a la vez. */
const QUICK_REPLIES: string[][] = [
  ["Ciudad", "Familia", "Trabajo", "Viajes", "Pickup o carga"],
  ["SUV", "Sedán o compacto", "Pickup", "Camión o utilitario", "No estoy seguro"],
  ["Compra Directa", "Financiamiento", "Quiero conocer ambas opciones"],
  ["Prefiero manual", "Prefiero automática", "Me da igual"],
];

const INTENT = /(quiero|me interesa|comprar|avanzar|financ|cotiz|reserv|cuánto pago|cuanto pago)/i;

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asesor`;

const AdvisorChat = ({ compact = false }: { compact?: boolean }) => {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showLead, setShowLead] = useState(false);
  const [preferredModel, setPreferredModel] = useState("");
  const startedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const buyingIntent =
    compareIds.length > 0 ||
    userTurns >= 3 ||
    messages.some((m) => m.role === "user" && INTENT.test(m.content));

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  useEffect(() => {
    if (started) focusInput();
  }, [started, focusInput]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || status !== "ready") return;

      if (!startedRef.current) {
        startedRef.current = true;
        trackContact("asesor-chat", { source: "asesor-ia" });
      }

      const history = [...messages, { id: crypto.randomUUID(), role: "user" as const, content: question }];
      setMessages(history);
      setInput("");
      setStatus("submitted");
      focusInput();

      const assistantId = crypto.randomUUID();

      try {
        const { data } = await supabase.auth.getSession();
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "No pude responder en este momento.");
        }

        setStatus("streaming");
        setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;
            try {
              const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
              if (delta) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m))
                );
              }
            } catch {
              /* fragmento incompleto */
            }
          }
        }
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        toast({
          title: "El asesor no pudo responder",
          description:
            e instanceof Error ? e.message : "Intenta de nuevo o escríbele a Rigoberto por WhatsApp.",
          variant: "destructive",
        });
      } finally {
        setStatus("ready");
        focusInput();
      }
    },
    [messages, status, focusInput]
  );

  const begin = (seed?: string) => {
    setStarted(true);
    setMessages([{ id: crypto.randomUUID(), role: "assistant", content: FIRST_MESSAGE }]);
    if (seed) {
      trackContact("asesor-quickstart", { source: seed });
      setTimeout(() => void send(seed), 0);
    }
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      trackContact("asesor-comparar", { model: id, source: "asesor-ia" });
      return [...prev, id];
    });
  };

  const summary = useMemo(
    () =>
      messages
        .slice(-8)
        .map((m) => `${m.role === "user" ? "Cliente" : "Asesor"}: ${m.content}`)
        .join("\n")
        .slice(0, 4000),
    [messages]
  );

  const quickReplies =
    started && status === "ready" && userTurns < QUICK_REPLIES.length
      ? QUICK_REPLIES[userTurns]
      : [];

  const recommendedFor = (m: ChatMessage): Vehicle[] =>
    m.role === "assistant" && m.content ? detectVehicles(m.content) : [];

  const height = compact ? "h-[70vh]" : "h-[calc(100vh-11rem)] max-h-[760px]";

  if (!started) {
    return (
      <div className={`flex flex-col justify-center ${height} px-5 py-8`}>
        <img
          src={asesorAvatar}
          alt="Asesor digital de Rigoberto Molina"
          width={512}
          height={512}
          className="h-20 w-20"
        />
        <h2 className="mt-5 font-heading text-2xl font-bold text-foreground">
          Encuentra el JAC ideal para ti
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Te ayudo a comparar modelos, entender planes y encontrar una opción según tu presupuesto.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="w-full sm:w-auto" onClick={() => begin()}>
            Comenzar asesoría
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => begin("Ya sé qué JAC quiero")}
          >
            Ya sé qué modelo quiero
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {QUICK_START.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => begin(q)}
              className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {q}
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Información orientativa. Precios, disponibilidad y condiciones comerciales deben ser
          confirmados directamente con Rigoberto Molina.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${height}`}>
      <Conversation className="flex-1">
        <ConversationContent className="gap-6">
          {messages.map((m) => {
            const models = recommendedFor(m);
            return (
              <div key={m.id} className="space-y-3">
                <Message from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? <MessageResponse>{m.content}</MessageResponse> : m.content}
                  </MessageContent>
                </Message>
                {models.length > 0 && status === "ready" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {models.map((v) => (
                      <AdvisorModelCard
                        key={v.id}
                        vehicle={v}
                        selected={compareIds.includes(v.id)}
                        onCompare={(id) => {
                          setPreferredModel(v.displayName);
                          toggleCompare(id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {compareIds.length >= 2 && (
            <AdvisorCompare
              ids={compareIds}
              onRemove={(id) => setCompareIds((p) => p.filter((x) => x !== id))}
              onClear={() => setCompareIds([])}
            />
          )}

          {showLead && (
            <AdvisorLeadForm
              defaults={{ model_interest: preferredModel }}
              summary={summary}
              onDone={() => setShowLead(false)}
            />
          )}

          {status === "submitted" && <Shimmer>Consultando los catálogos...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-4 pb-4 pt-3">
        {quickReplies.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {quickReplies.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void send(q)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {q}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}

        <PromptInput
          onSubmit={(_m, e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre modelos, cuotas o recaudos"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() || status !== "ready"} />
          </PromptInputFooter>
        </PromptInput>

        {buyingIntent && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowLead(true);
                trackContact("lead", { source: "asesor-ia-abrir" });
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Dejar mis datos
            </Button>
            <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
              <a
                href={waLink(
                  buildWhatsAppMessage({
                    name: "",
                    city: "",
                    model_interest: preferredModel,
                    use_case: "",
                    purchase_method: "",
                    initial_budget: "",
                    monthly_budget: "",
                    phone: "",
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContact("whatsapp", { source: "asesor-ia" })}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Hablar con Rigoberto por WhatsApp
              </a>
            </Button>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Información orientativa. Precios, disponibilidad y condiciones comerciales deben ser
          confirmados directamente con Rigoberto Molina.
        </p>
      </div>
    </div>
  );
};

export default AdvisorChat;
