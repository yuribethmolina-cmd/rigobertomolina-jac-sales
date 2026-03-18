import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "¿Cómo funciona la compra directa de un vehículo JAC?",
    a: "La compra directa consiste en 7 pagos iguales: una afiliación inicial, 5 cuotas mensuales consecutivas y un pago previo a la entrega. No requiere financiamiento bancario ni historial crediticio.",
  },
  {
    q: "¿Qué diferencia hay entre Compra Directa y Pago Fácil?",
    a: "En Compra Directa haces 7 pagos iguales (afiliación + 5 cuotas + previo a entrega). En Pago Fácil haces 12 pagos: una afiliación, 10 cuotas mensuales más pequeñas y una última cuota mayor previo a la entrega. Pago Fácil te permite cuotas más accesibles mes a mes.",
  },
  {
    q: "¿Los precios incluyen IVA y otros impuestos?",
    a: "Los montos publicados son referenciales y están sujetos a variación por flete, seguro, IVA, IGTF y gastos de nacionalización. Contáctame para recibir el cronograma actualizado con el monto exacto.",
  },
  {
    q: "¿Qué garantía tienen los vehículos JAC?",
    a: "Todos los vehículos JAC nuevos incluyen garantía de fábrica. La cobertura y duración varían según el modelo. Escríbeme para conocer los detalles específicos de garantía del modelo que te interesa.",
  },
  {
    q: "¿Cuánto tarda el proceso desde el primer pago hasta la entrega?",
    a: "En Compra Directa el proceso dura aproximadamente 6-7 meses (5 cuotas mensuales + trámites). En Pago Fácil puede extenderse a 11-12 meses. Los tiempos pueden variar según disponibilidad y logística.",
  },
  {
    q: "¿Cómo es el proceso de nacionalización del vehículo?",
    a: "La nacionalización incluye los trámites aduaneros, pago de aranceles e impuestos de importación, y la obtención de la documentación legal para circular en Venezuela. Bel JAC se encarga de gestionar todo el proceso.",
  },
  {
    q: "¿Puedo elegir el color de mi vehículo?",
    a: "Sí, la disponibilidad de colores depende del modelo y del stock vigente. Al momento de tu afiliación puedes indicar tu preferencia de color y te confirmaremos la disponibilidad.",
  },
  {
    q: "¿Dónde puedo retirar mi vehículo?",
    a: "La entrega se coordina directamente contigo. Los puntos de entrega dependen de la logística vigente. Contáctame para conocer las opciones de entrega disponibles para tu zona.",
  },
];

const FAQSection = () => (
  <section id="faq" className="py-20 bg-secondary/30 section-divider">
    <div className="section-container max-w-3xl">
      <div className="text-center">
        <h2 className="section-title">Preguntas Frecuentes</h2>
        <p className="section-subtitle">Todo lo que necesitas saber antes de comprar tu JAC</p>
        <div className="teal-underline mx-auto" />
      </div>

      <Accordion type="single" collapsible className="mt-12 space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="card-glow border-none px-6"
          >
            <AccordionTrigger className="text-left font-heading font-bold text-base hover:no-underline hover:text-primary transition-colors">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
