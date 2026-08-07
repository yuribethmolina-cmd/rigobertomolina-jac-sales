import { Send } from "lucide-react";
import { waLink } from "@/lib/constants";

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const WhatsAppButton = ({
  message,
  label = "Enviar por WhatsApp",
  className = "",
  disabled = false,
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    if (!message) return;
    window.open(waLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !message}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-heading font-bold px-6 py-4 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      <Send size={18} /> {label}
    </button>
  );
};

export default WhatsAppButton;
