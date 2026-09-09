import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdvisorChat from "@/components/advisor/AdvisorChat";
import asesorAvatar from "@/assets/asesor-avatar.png";

const AdvisorFloat = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir el asesor JAC"
        title="Asesor JAC: te ayudo a elegir modelo y plan"
        className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg ring-2 ring-primary transition-transform hover:scale-110"
      >
        <img
          src={asesorAvatar}
          alt=""
          width={512}
          height={512}
          loading="lazy"
          className="h-10 w-10"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0 p-0 [&>button]:hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-4 py-3">
            <DialogTitle className="text-base">Asesor JAC de Rigoberto</DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>
          <AdvisorChat compact />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdvisorFloat;
