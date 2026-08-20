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

const pasajeros: CatalogModel[] = [
  { name: "Aventura Pro a Gasolina", image: "https://jacvenezuela.com/wp-content/uploads/2025/10/jac_banners_aventura_pro_edicion_limitada-1024x427.jpg", tagline: "La pickup más equipada del catálogo", priceCD: "$6.502/mes", pricePF: "$3.638/mes", fichaUrl: "https://jacvenezuela.com/portfolio/aventura-pro-a-gasolina/" },
  { name: "Aventura a Gasolina", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/t9-Aventura-Gasolina-jac-motors-venezuela-1024x427.jpg", tagline: "Potencia y estilo en cada ruta", priceCD: "$5.362/mes", pricePF: "$3.001/mes", fichaUrl: "https://jacvenezuela.com/portfolio/aventura-gasolina/" },
  { name: "Limited", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/jac-pickup-limited-1-1024x427.png", tagline: "Pickup edición limitada — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Arena Sport Manual", image: "https://jacvenezuela.com/wp-content/uploads/2025/09/jac_banners_arena_sport_mt-1024x427.jpg", tagline: "SUV compacto, perfecto para la ciudad", priceCD: "$2.428/mes", pricePF: "$1.358/mes", fichaUrl: "https://jacvenezuela.com/portfolio/arena-sport/" },
  { name: "Arena Sport Automático", image: "https://jacvenezuela.com/wp-content/uploads/2025/09/jac_banners_arena_sport_at-1024x427.jpg", tagline: "Comodidad automática para el día a día", priceCD: "$2.641/mes", pricePF: "$1.474/mes", fichaUrl: "https://jacvenezuela.com/portfolio/arena-sport-automatico/" },
  { name: "Arena Pro", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/jac_-motors_banners-Arena-Pro-1024x427.png", tagline: "Tracción 4x4 para ir más allá", priceCD: "$2.910/mes", pricePF: "$1.625/mes", fichaUrl: "https://jacvenezuela.com/portfolio/arena-pro/" },
  { name: "Nevado Manual", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/vehiculo-nevado-js4-de-jac-motors-venezuela-1024x427.jpg", tagline: "El SUV familiar más consultado", priceCD: "$3.018/mes", pricePF: "$2.402/mes", featured: "MÁS CONSULTADO", fichaUrl: "https://jacvenezuela.com/portfolio/nevado-manual/" },
  { name: "Nevado Automático", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/nevado-automatico-2025-de-jac-motors-venezuela-1024x427.jpg", tagline: "La misma potencia, en automático", priceCD: "$3.715/mes", pricePF: "$2.677/mes", fichaUrl: "https://jacvenezuela.com/portfolio/nevado-automatico/" },
  { name: "Tepuy Pro", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac_banners_tepuy_pro-1024x427.jpg", tagline: "El SUV premium de JAC", priceCD: "$4.285/mes", pricePF: "$2.239/mes", fichaUrl: "https://jacvenezuela.com/portfolio/tepuy-pro/" },
  { name: "Refine", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/JAC-REFINE-EN-VENEZUELA-1024x427.jpg", tagline: "Sedán premium con tecnología de punta", priceCD: "$3.980/mes", pricePF: "$2.924/mes", fichaUrl: "https://jacvenezuela.com/portfolio/refine/" },
  { name: "RF8", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac-rf8-1024x427.png", tagline: "SUV insignia — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "La Venezolana a Gasolina 4×2", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/T6-la-venezolana-de-jac-motors-venezuela-1024x427.jpg", tagline: "La pickup venezolana por excelencia", priceCD: "$3.034/mes", pricePF: "$1.700/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana/" },
  { name: "La Venezolana a Diésel 4×2", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/jac_banners_la_venezolana_diesel_4x2_4x4-1024x427.jpg", tagline: "Mayor eficiencia para trabajo pesado", priceCD: "$3.278/mes", pricePF: "$1.840/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana-diesel/" },
  { name: "La Venezolana a Diésel 4×4", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/jac-La-Venezolana-a-diesel-4x4-1-1024x427.png", tagline: "Tracción total diésel — para cualquier terreno", priceCD: "Consultar", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana-diesel/" },
  { name: "La Venezolana Pro 4×4", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac_banners_la_venezolana_pro-1-1024x427.jpg", tagline: "La pickup más poderosa de la línea", priceCD: "$4.250/mes", pricePF: "$2.385/mes", fichaUrl: "https://jacvenezuela.com/portfolio/la-venezolana-pro-4x4/" },
  { name: "Savanna", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/js8-Savanna-jac-motors-venezuela-1024x427.jpg", tagline: "Minivan espaciosa para familias grandes", priceCD: "$7.288/mes", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/savanna/" },
  { name: "GX7", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/GX7-1-1-1024x427.png", tagline: "SUV 180 HP Turbo 7DCT · Cámara 360° · Techo panorámico", priceCD: "$4.407/mes", pricePF: "$2.212/mes", featured: "NUEVO", fichaUrl: "https://jacvenezuela.com/espera-termino-jac-presenta-el-gx7/" },
  { name: "Élite", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/vehiculo-elite-j7-jac-motors-venezuela-1024x427.jpg", tagline: "Sedán elegante con acabados premium", priceCD: "$5.195/mes", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/elite/" },
  { name: "Sunray V4 Pasajeros", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/SUNRAY-V4-PASAJEROS-11-1-PUESTOS-1-1024x427.png", tagline: "Van V4 para transporte de pasajeros", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Sunray V4 Carga", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/jac-SUNRAY-V4-CARGA-1024x427.png", tagline: "Van V4 para carga", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Sunray V6 Pasajeros", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-171-1024x427.webp", tagline: "Van para transporte colectivo o corporativo", priceCD: "$4.908/mes", pricePF: "$2.785/mes", fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v6-pasajeros/" },
  { name: "Sunray V6 Carga", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-CARGA-1-1024x425.webp", tagline: "Van de carga versátil y eficiente", priceCD: "$5.529/mes", pricePF: "$3.119/mes", fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v6-carga-2/" },
  { name: "Sunray V6 Van Escolar", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/SUNRAY-V6-ESCOLAR-1024x427.png", tagline: "Van escolar — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
];

const camiones: CatalogModel[] = [
  { name: "X100 Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/X100-FERRETERO-1024x427.webp", priceCD: "$2.612/mes", pricePF: "$1.454/mes", fichaUrl: "https://jacvenezuela.com/portfolio/x100-ferretero/" },
  { name: "Urban 3 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/URBAN-FERRETERO-1024x427.webp", priceCD: "$3.503/mes", pricePF: "$1.962/mes", fichaUrl: "https://jacvenezuela.com/portfolio/urban-3-ton/" },
  { name: "C 3500 Ferretero 4X4", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/C-3500-FERRETERO-4X4-1024x427.webp", priceCD: "$4.805/mes", pricePF: "$2.690/mes", fichaUrl: "https://jacvenezuela.com/portfolio/c-3500-ferretero-4x4/" },
  { name: "Doble Cabina Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/DOBLE-CABINA-FERRETERO-1024x427.webp", priceCD: "$3.899/mes", pricePF: "$2.183/mes", fichaUrl: "https://jacvenezuela.com/portfolio/doble-cabina-ferretero/" },
  { name: "6T Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", priceCD: "$4.938/mes", pricePF: "$2.784/mes", fichaUrl: "https://jacvenezuela.com/portfolio/6t-ferretero/" },
  { name: "Búfalo 12 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", priceCD: "$7.476/mes", pricePF: "$4.202/mes", fichaUrl: "https://jacvenezuela.com/portfolio/bufalo-12-ton/" },
  { name: "Búfalo XL", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", priceCD: "$7.910/mes", pricePF: "$4.448/mes", fichaUrl: "https://jacvenezuela.com/portfolio/bufalo-xl/" },
  { name: "Búfalo Cava de Conservación", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/BUFALO-CAVA-DE-CONSERVACION-2-1024x427.png", tagline: "Cava térmica para cadena de frío", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Búfalo Brazo Hidráulico", image: "https://jacvenezuela.com/wp-content/uploads/2026/06/BUFALO-BRAZO-HIDRAULICO-1-1024x427.png", tagline: "Brazo hidráulico para carga pesada", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Leyenda 20 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/LEYENDA-1024x425.webp", priceCD: "$10.433/mes", pricePF: "$5.895/mes", fichaUrl: "https://jacvenezuela.com/portfolio/leyenda-20-ton/" },
  { name: "Leyenda 380 HP", image: "https://jacvenezuela.com/wp-content/uploads/2026/07/LEYENDA-380-HP-1024x427.png", tagline: "Versión de mayor potencia — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Cavalino", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CAVALINO-1024x425.webp", priceCD: "$7.487/mes", pricePF: "$4.197/mes", fichaUrl: "https://jacvenezuela.com/portfolio/cavalino/" },
  { name: "Bachaco 400 HP", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CHUTO-4251-430-1024x425.webp", priceCD: "$9.728/mes", pricePF: "$5.429/mes", fichaUrl: "https://jacvenezuela.com/portfolio/chuto-4251-430-hp/" },
  { name: "Chuto 4251 430 HP", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CHUTO-4251-430-1024x425.webp", priceCD: "$11.615/mes", pricePF: "$6.513/mes", fichaUrl: "https://jacvenezuela.com/portfolio/chuto-4251-430-hp/" },
  { name: "Minero 14M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Minero-14m3-Capacidad-Tolva-1024x425.jpg", priceCD: "$13.995/mes", pricePF: "$5.585/mes", fichaUrl: "https://jacvenezuela.com/portfolio/minero-14m3/" },
  { name: "Minero 20M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Minero-20m3-Capacidad-Tolva-1024x425.webp", priceCD: "$12.883/mes", pricePF: "$7.784/mes", fichaUrl: "https://jacvenezuela.com/portfolio/minero-20m3/" },
  { name: "Minero 28M3", image: "https://jacvenezuela.com/wp-content/uploads/2026/07/MINERO-28-M3-1024x427.png", tagline: "Volqueta de mayor capacidad — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
];

const utilitarios: CatalogModel[] = [
  { name: "Sunray V4 Ambulancia", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V4-AMBULANCIA-1024x425.webp", priceCD: "$5.330/mes", pricePF: "$4.837/mes", fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v4-ambulancia/" },
  { name: "Compactador 5 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Compactador-5-ton-1024x425.webp", priceCD: "$4.661/mes", pricePF: "$5.642/mes", fichaUrl: "https://jacvenezuela.com/portfolio/compactador-5-ton/" },
  { name: "Compactador 10M3", image: "https://jacvenezuela.com/wp-content/uploads/2026/05/COMPACTADOR-10-M3-2-1024x427.png", tagline: "Compactador de mayor capacidad — consulta disponibilidad", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Urban Chasis Largo 3 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/Urban-Chasis-1024x576.webp", priceCD: "$3.302/mes", pricePF: "$1.850/mes", fichaUrl: "https://jacvenezuela.com/portfolio/urban-3-ton/" },
  { name: "M4 Carroza", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-171-1024x427.webp", priceCD: "$6.386/mes", pricePF: "$3.875/mes", referentialImage: true, fichaUrl: "https://jacvenezuela.com/portfolio/sunray-v6-pasajeros/" },
];

const electricos: CatalogModel[] = [
  { name: "Voltio Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/VOLTIO-1024x427.webp", tagline: "Movilidad eléctrica urbana compacta", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/voltio-electrico/" },
  { name: "Electrón Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/ELECTRON-ELECTRICO-1-1024x427.webp", tagline: "Eficiencia eléctrica en diseño moderno", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/electron-electrico/" },
  { name: "Nevado Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/jac_banners_Nevado_electrico-1024x427.jpg", tagline: "El SUV Nevado en versión 100% eléctrica", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/nevado-electrico/" },
  { name: "1073 Camión Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/1073-ELECTRICO-1024x427.webp", tagline: "Solución eléctrica para carga comercial", pricePF: "Consultar", fichaUrl: "https://jacvenezuela.com/portfolio/1073-camion-electrico/" },
];

const tabs = ["PASAJEROS", "CAMIONES", "ELÉCTRICOS", "UTILITARIOS"] as const;
type Tab = (typeof tabs)[number];

const tabData: Record<Tab, CatalogModel[]> = {
  PASAJEROS: pasajeros,
  CAMIONES: camiones,
  "ELÉCTRICOS": electricos,
  UTILITARIOS: utilitarios,
};

const ModelsSection = () => {
  const [active, setActive] = useState<Tab>("PASAJEROS");
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

        {/* Tabs */}
        <div className="flex justify-center gap-2 mt-10 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2.5 rounded-lg font-heading font-bold text-sm tracking-wide transition-colors ${
                active === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
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

        {active === "ELÉCTRICOS" && (
          <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            ⚡ Los vehículos eléctricos JAC están sujetos a disponibilidad. Consulta con Rigoberto para más información.
          </p>
        )}
      </div>
    </section>
  );
};

export default ModelsSection;
