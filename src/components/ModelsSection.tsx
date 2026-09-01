import { useState } from "react";
import CatalogCard from "./CatalogCard";

export interface CatalogModel {
  name: string;
  image: string;
  tagline?: string;
  priceCD?: string;
  pricePF?: string;
  featured?: string;
  referentialImage?: boolean;
  fichaUrl?: string;
}

const suv: CatalogModel[] = [
  { name: "Arena Sport Manual", image: "https://jacvenezuela.com/wp-content/uploads/2025/09/jac_banners_arena_sport_mt-1024x427.jpg", tagline: "SUV compacto, perfecto para la ciudad", priceCD: "$2.568/mes", pricePF: "$1.242/mes", fichaUrl: "https://jacvenezuela.com/portfolio/arena-sport/" },
  { name: "Arena Sport Automático", image: "https://jacvenezuela.com/wp-content/uploads/2025/09/jac_banners_arena_sport_at-1024x427.jpg", tagline: "Comodidad automática para el día a día", priceCD: "$2.775/mes", pricePF: "$1.351/mes", fichaUrl: "https://jacvenezuela.com/portfolio/arena-sport-automatico/" },
  { name: "Arena Pro", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/jac_-motors_banners-Arena-Pro-1024x427.png", tagline: "Tracción 4x4 para ir más allá", priceCD: "$3.040/mes", pricePF: "$1.491/mes", fichaUrl: "https://jacvenezuela.com/portfolio/arena-pro/" },
  { name: "Nevado Manual", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/vehiculo-nevado-js4-de-jac-motors-venezuela-1024x427.jpg", tagline: "El SUV familiar más consultado", priceCD: "$3.352/mes", pricePF: "$1.655/mes", featured: "MÁS CONSULTADO", fichaUrl: "https://jacvenezuela.com/portfolio/nevado-manual/" },
  { name: "Nevado Automático", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/nevado-automatico-2025-de-jac-motors-venezuela-1024x427.jpg", tagline: "La misma potencia, en automático", priceCD: "$3.715/mes", pricePF: "$2.677/mes", fichaUrl: "https://jacvenezuela.com/portfolio/nevado-automatico/" },
  { name: "Tepuy Pro", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac_banners_tepuy_pro-1024x427.jpg", tagline: "El SUV premium de JAC", priceCD: "$4.594/mes", pricePF: "$2.311/mes", fichaUrl: "https://jacvenezuela.com/portfolio/tepuy-pro/" },
  { name: "GX7", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/GX7-1-1-1024x427.png", tagline: "SUV 180 HP Turbo 7DCT · Cámara 360° · Techo panorámico", priceCD: "$4.407/mes", pricePF: "$2.212/mes", featured: "NUEVO", fichaUrl: "https://jacvenezuela.com/espera-termino-jac-presenta-el-gx7/" },
  { name: "RF8", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac-rf8-1024x427.png", tagline: "SUV insignia — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
];

const sedan: CatalogModel[] = [
  { name: "Refine", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/JAC-REFINE-EN-VENEZUELA-1024x427.jpg", tagline: "Sedán premium con tecnología de punta", priceCD: "$7.665/mes", pricePF: "$3.931/mes", fichaUrl: "https://jacvenezuela.com/portfolio/refine/" },
  { name: "Élite", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/vehiculo-elite-j7-jac-motors-venezuela-1024x427.jpg", tagline: "Sedán elegante con acabados premium", priceCD: "$4.258/mes", pricePF: "$2.380/mes", fichaUrl: "https://jacvenezuela.com/portfolio/elite/" },
];

const pickup: CatalogModel[] = [
  { name: "Aventura Pro a Gasolina", image: "https://jacvenezuela.com/wp-content/uploads/2025/10/jac_banners_aventura_pro_edicion_limitada-1024x427.jpg", tagline: "La pickup más equipada del catálogo", priceCD: "$6.813/mes", pricePF: "$3.478/mes", fichaUrl: "https://jacvenezuela.com/portfolio/aventura-pro-a-gasolina/" },
  { name: "Aventura a Gasolina", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/t9-Aventura-Gasolina-jac-motors-venezuela-1024x427.jpg", tagline: "Potencia y estilo en cada ruta", priceCD: "$5.510/mes", pricePF: "$2.790/mes", fichaUrl: "https://jacvenezuela.com/portfolio/aventura-gasolina/" },
  { name: "Limited", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/jac-pickup-limited-1-1024x427.png", tagline: "Pickup edición limitada", priceCD: "$5.601/mes", pricePF: "$2.838/mes" },
  { name: "La Venezolana a Gasolina 4×2", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/T6-la-venezolana-de-jac-motors-venezuela-1024x427.jpg", tagline: "La pickup venezolana por excelencia", priceCD: "$3.319/mes", pricePF: "$1.635/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana/" },
  { name: "La Venezolana a Diésel 4×2", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/jac_banners_la_venezolana_diesel_4x2_4x4-1024x427.jpg", tagline: "Mayor eficiencia para trabajo pesado", priceCD: "$3.423/mes", pricePF: "$1.690/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana-diesel/" },
  { name: "La Venezolana a Diésel 4×4", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/jac-La-Venezolana-a-diesel-4x4-1-1024x427.png", tagline: "Tracción total diésel — para cualquier terreno", priceCD: "$3.828/mes", pricePF: "$1.903/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana-diesel/" },
  { name: "La Venezolana Pro 4×4", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac_banners_la_venezolana_pro-1-1024x427.jpg", tagline: "La pickup más poderosa de la línea", priceCD: "$4.522/mes", pricePF: "$2.269/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana-pro-4x4/" },
];

const van: CatalogModel[] = [
  { name: "Savanna", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/js8-Savanna-jac-motors-venezuela-1024x427.jpg", tagline: "Minivan espaciosa para familias grandes", priceCD: "$4.924/mes", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/savanna/" },
  { name: "Sunray V4 Pasajeros", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/SUNRAY-V4-PASAJEROS-11-1-PUESTOS-1-1024x427.png", tagline: "Van V4 para transporte de pasajeros", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Sunray V4 Carga", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/jac-SUNRAY-V4-CARGA-1024x427.png", tagline: "Van V4 para carga", priceCD: "$5.238/mes", pricePF: "Consultar" },
  { name: "Sunray V6 Pasajeros", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-171-1024x427.webp", tagline: "Van para transporte colectivo o corporativo", priceCD: "$5.945/mes", pricePF: "$2.785/mes", fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v6-pasajeros/" },
  { name: "Sunray V6 Carga", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-CARGA-1-1024x425.webp", tagline: "Van de carga versátil y eficiente", priceCD: "$5.643/mes", pricePF: "$3.119/mes", fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v6-carga-2/" },
  { name: "Sunray V6 Van Escolar", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/SUNRAY-V6-ESCOLAR-1024x427.png", tagline: "Van escolar — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Autobús 28+6+1 Puestos", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/AUTOBUS-2861-PUESTOS-1-1024x427.png", tagline: "Autobús de transporte colectivo — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
];

const camiones: CatalogModel[] = [
  { name: "X100 Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/X100-FERRETERO-1024x427.webp", priceCD: "$2.489/mes", pricePF: "$1.197/mes", fichaUrl: "https://jacvenezuela.com/portfolio/x100-ferretero/" },
  { name: "X100 Cava de Conservación", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/X100-CAVA-DE-CONSERVACION-1024x427.png", tagline: "Cava de frío en chasis X100", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Urban 3 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/URBAN-FERRETERO-1024x427.webp", priceCD: "$3.630/mes", pricePF: "$1.798/mes", fichaUrl: "https://jacvenezuela.com/portfolio/urban-3-ton/" },
  { name: "Urban Cava Seca", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/URBAN-FERRETERO-1024x427.webp", tagline: "Cava seca en chasis Urban", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Urban Cava de Conservación", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/URBAN-FERRETERO-1024x427.webp", tagline: "Cava de frío en chasis Urban", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Urban Cava Refrigerada", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/URBAN-FERRETERO-1024x427.webp", tagline: "Cava refrigerada en chasis Urban", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Urban Chasis Largo 3 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/Urban-Chasis-1024x576.webp", priceCD: "$3.427/mes", pricePF: "$1.692/mes", fichaUrl: "https://jacvenezuela.com/portfolio/urban-3-ton/" },
  { name: "C 3500 Ferretero 4X4", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/C-3500-FERRETERO-4X4-1024x427.webp", priceCD: "$4.958/mes", pricePF: "$2.499/mes", fichaUrl: "https://jacvenezuela.com/portfolio/c-3500-ferretero-4x4/" },
  { name: "Doble Cabina Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/DOBLE-CABINA-FERRETERO-1024x427.webp", priceCD: "$4.056/mes", pricePF: "$2.023/mes", fichaUrl: "https://jacvenezuela.com/portfolio/doble-cabina-ferretero/" },
  { name: "Doble Cabina Brazo Elevador 20M", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/DOBLE-CABINA-FERRETERO-1024x427.webp", tagline: "Brazo elevador 20m en chasis Doble Cabina", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "6T Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", priceCD: "$5.270/mes", pricePF: "$2.664/mes", fichaUrl: "https://jacvenezuela.com/portfolio/6t-ferretero/" },
  { name: "6T Chasis", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/6T-CHASIS--1024x427.png", tagline: "Chasis 6T para carrocería a medida", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "6T Cava Seca", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", tagline: "Cava seca en chasis 6T", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "6T Cava de Conservación", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", tagline: "Cava de frío en chasis 6T", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "6T Cava Refrigerada", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", tagline: "Cava refrigerada en chasis 6T", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "6T Brazo Hidráulico", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", tagline: "Brazo hidráulico en chasis 6T", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Búfalo 12 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", priceCD: "$7.541/mes", pricePF: "$3.862/mes", fichaUrl: "https://jacvenezuela.com/portfolio/bufalo-12-ton/" },
  { name: "Búfalo XL", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", priceCD: "$7.932/mes", pricePF: "$4.068/mes", fichaUrl: "https://jacvenezuela.com/portfolio/bufalo-xl/" },
  { name: "Búfalo Cava Seca", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", tagline: "Cava seca en chasis Búfalo", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Búfalo Cava de Conservación", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/BUFALO-CAVA-DE-CONSERVACION-2-1024x427.png", tagline: "Cava térmica para cadena de frío", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Búfalo Cava Refrigerada", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", tagline: "Cava refrigerada en chasis Búfalo", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Búfalo Brazo Hidráulico", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/BUFALO-BRAZO-HIDRAULICO-1-1024x427.png", tagline: "Brazo hidráulico para carga pesada", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Leyenda 20 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/LEYENDA-1024x425.webp", priceCD: "$10.853/mes", pricePF: "$5.609/mes", fichaUrl: "https://jacvenezuela.com/portfolio/leyenda-20-ton/" },
  { name: "Leyenda 380 HP", image: "https://jacvenezuela.com/wp-content/uploads/2026/07/LEYENDA-380-HP-1024x427.png", tagline: "Versión de mayor potencia — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Leyenda Cava Seca", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/LEYENDA-1024x425.webp", tagline: "Cava seca en chasis Leyenda", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Leyenda Cava Refrigerada", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/LEYENDA-1024x425.webp", tagline: "Cava refrigerada en chasis Leyenda", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Leyenda Brazo Hidráulico", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/LEYENDA-1024x425.webp", tagline: "Brazo hidráulico en chasis Leyenda", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
  { name: "Cavalino", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CAVALINO-1024x425.webp", tagline: "Chuto 22 Ton", priceCD: "$7.606/mes", pricePF: "$3.896/mes", fichaUrl: "https://jacvenezuela.com/portfolio/cavalino/" },
  { name: "Bachaco 400 HP", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CHUTO-4251-430-1024x425.webp", priceCD: "$10.249/mes", pricePF: "$5.429/mes", fichaUrl: "https://jacvenezuela.com/portfolio/chuto-4251-430-hp/" },
  { name: "Chuto 4251 430 HP", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CHUTO-4251-430-1024x425.webp", priceCD: "$11.960/mes", pricePF: "$6.193/mes", fichaUrl: "https://jacvenezuela.com/portfolio/chuto-4251-430-hp/" },
  { name: "Minero 14M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Minero-14m3-Capacidad-Tolva-1024x425.jpg", priceCD: "$10.669/mes", pricePF: "$5.512/mes", fichaUrl: "https://jacvenezuela.com/portfolio/minero-14m3/" },
  { name: "Minero 20M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Minero-20m3-Capacidad-Tolva-1024x425.webp", priceCD: "$14.109/mes", pricePF: "$7.327/mes", fichaUrl: "https://jacvenezuela.com/portfolio/minero-20m3/" },
  { name: "Minero 28M3", image: "https://jacvenezuela.com/wp-content/uploads/2026/07/MINERO-28-M3-1024x427.png", tagline: "Volqueta de mayor capacidad — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Volkan Mezclador 9M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", tagline: "Mezclador de concreto 9M3 — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar", referentialImage: true },
];

const utilitarios: CatalogModel[] = [
  { name: "Sunray V4 Ambulancia", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V4-AMBULANCIA-1024x425.webp", priceCD: "$5.330/mes", pricePF: "$4.837/mes", fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v4-ambulancia/" },
  { name: "Compactador 5 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Compactador-5-ton-1024x425.webp", priceCD: "$4.661/mes", pricePF: "$5.642/mes", fichaUrl: "https://jacvenezuela.com/portfolio/compactador-5-ton/" },
  { name: "Compactador 10M3", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/COMPACTADOR-10-M3-2-1024x427.png", tagline: "Compactador de mayor capacidad — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "M4 Carroza", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-171-1024x427.webp", priceCD: "$6.386/mes", pricePF: "$3.875/mes", referentialImage: true, fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v6-pasajeros/" },
];

const electricos: CatalogModel[] = [
  { name: "Voltio Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/VOLTIO-1024x427.webp", tagline: "Movilidad eléctrica urbana compacta", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/voltio-electrico/" },
  { name: "Electrón Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/ELECTRON-ELECTRICO-1-1024x427.webp", tagline: "Eficiencia eléctrica en diseño moderno", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/electron-electrico/" },
  { name: "Nevado Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/jac_banners_Nevado_electrico-1024x427.jpg", tagline: "El SUV Nevado en versión 100% eléctrica", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/nevado-electrico/" },
  { name: "1073 Camión Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/1073-ELECTRICO-1024x427.webp", tagline: "Solución eléctrica para carga comercial", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/1073-camion-electrico/" },
];

const tabs = ["SUV", "SEDÁN", "PICKUP", "VAN", "CAMIONES", "UTILITARIOS", "ELÉCTRICO"] as const;
type Tab = (typeof tabs)[number];

export const tabData: Record<Tab, CatalogModel[]> = {
  SUV: suv,
  SEDÁN: sedan,
  PICKUP: pickup,
  VAN: van,
  CAMIONES: camiones,
  UTILITARIOS: utilitarios,
  ELÉCTRICO: electricos,
};

export const allCatalogModels: CatalogModel[] = Object.values(tabData).flat();

export const catalogCategoryOf = (name: string): string | undefined =>
  (Object.keys(tabData) as Tab[]).find((t) => tabData[t].some((m) => m.name === name));


const ModelsSection = () => {
  const [active, setActive] = useState<Tab>("SUV");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const handleToggle = (name: string) => {
    setExpandedModel((prev) => (prev === name ? null : name));
  };

  const handleTabChange = (tab: Tab) => {
    setActive(tab);
    setExpandedModel(null);
  };

  return (
    <section id="modelos" className="py-20 section-divider">
      <div className="section-container">
        <div className="text-center">
          <h2 className="section-title">Modelos disponibles</h2>
          <p className="section-subtitle">Encuentra el JAC que va contigo — haz clic para consultar</p>
          <div className="teal-underline mx-auto" />
        </div>

        {/* Tabs — scroll horizontal en mobile */}
        <div className="mt-10 overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max mx-auto px-1 justify-start md:justify-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2.5 rounded-lg font-heading font-bold text-sm tracking-wide transition-colors whitespace-nowrap ${
                  active === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {tabData[active].map((m) => (
            <CatalogCard
              key={m.name}
              model={m}
              isExpanded={expandedModel === m.name}
              onToggle={() => handleToggle(m.name)}
            />
          ))}
        </div>

        {active === "ELÉCTRICO" && (
          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            ⚡ Los vehículos eléctricos JAC están sujetos a disponibilidad. Consulta con Rigoberto para más información.
          </p>
        )}
      </div>
    </section>
  );
};

export default ModelsSection;
