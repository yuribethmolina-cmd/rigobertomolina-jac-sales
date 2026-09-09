import { useCallback, useRef, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { waLink } from "@/lib/constants";
import { trackContact } from "@/lib/track";
import { toast } from "@/hooks/use-toast";
import asesorAvatar from "@/assets/asesor-avatar.png";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quiero una camioneta para trabajar",
  "¿Cuál es la cuota más baja?",
  "¿Qué recaudos piden para un crédito?",
  "Quiero llevarme el carro de una",
];

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asesor`;

const AdvisorChat = ({ compact = false }: { compact?: boolean }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "submitted" | "streaming">("ready");
  const startedRef = useRef(false);

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
      }
    },
    [messages, status]
  );

  return (
    <div className={`flex flex-col ${compact ? "h-[70vh]" : "h-[calc(100vh-11rem)] max-h-[760px]"}`}>
      <Conversation className="flex-1">
        <ConversationContent className="gap-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md py-8 text-center">
              <img
                src={asesorAvatar}
                alt="Asesor digital de Rigoberto Molina"
                width={512}
                height={512}
                className="mx-auto h-20 w-20"
              />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Asesor JAC de Rigoberto
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cuéntame para qué necesitas el vehículo y cuánto puedes pagar al mes. Te digo qué
                modelo y qué plan te conviene, con montos referenciales de los catálogos vigentes.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent>
                {m.role === "assistant" ? (
                  <MessageResponse>{m.content}</MessageResponse>
                ) : (
                  m.content
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" && <Shimmer>Consultando los catálogos...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border px-4 pb-4 pt-3">
        <PromptInput
          onSubmit={(_m, e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta sobre modelos, cuotas o recaudos"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() || status !== "ready"} />
          </PromptInputFooter>
        </PromptInput>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Montos referenciales, sujetos a cambios y disponibilidad. Confirma condiciones con
            Rigoberto Molina.
          </p>
          <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
            <a
              href={waLink("Hola Rigoberto, estuve conversando con tu asesor digital y quiero avanzar.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact("whatsapp", { source: "asesor-ia" })}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Hablar con Rigoberto
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorChat;
