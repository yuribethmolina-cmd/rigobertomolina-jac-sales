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
}

const pasajeros: CatalogModel[] = [
  { name: "Aventura Pro a Gasolina", image: "https://jacvenezuela.com/wp-content/uploads/2025/10/jac_banners_aventura_pro_edicion_limitada-1024x427.jpg", tagline: "La pickup más equipada del catálogo", priceCD: "$5.259/mes", pricePF: "$3.645/mes" },
  { name: "Aventura a Gasolina", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/t9-Aventura-Gasolina-jac-motors-venezuela-1024x427.jpg", tagline: "Potencia y estilo en cada ruta", priceCD: "$4.165/mes", pricePF: "$3.645/mes" },
  { name: "Arena Sport Automático", image: "https://jacvenezuela.com/wp-content/uploads/2025/09/jac_banners_arena_sport_at-1024x427.jpg", tagline: "Comodidad automática para el día a día", priceCD: "$3.236/mes", pricePF: "$1.694/mes" },
  { name: "Arena Sport Manual", image: "https://jacvenezuela.com/wp-content/uploads/2025/09/jac_banners_arena_sport_mt-1024x427.jpg", tagline: "SUV compacto, perfecto para la ciudad", priceCD: "$2.564/mes", pricePF: "$1.576/mes" },
  { name: "Arena Pro", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/jac_-motors_banners-Arena-Pro-1024x427.png", tagline: "Tracción 4x4 para ir más allá", priceCD: "$3.395/mes", pricePF: "$2.083/mes" },
  { name: "Refine", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/JAC-REFINE-EN-VENEZUELA-1024x427.jpg", tagline: "Sedán premium con tecnología de punta", priceCD: "$4.728/mes", pricePF: "$4.114/mes" },
  { name: "Tepuy Pro", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac_banners_tepuy_pro-1024x427.jpg", tagline: "El SUV premium de JAC", priceCD: "$5.259/mes", pricePF: "$2.239/mes" },
  { name: "La Venezolana Pro 4×4", image: "https://jacvenezuela.com/wp-content/uploads/2025/06/jac_banners_la_venezolana_pro-1-1024x427.jpg", tagline: "La pickup más poderosa de la línea", priceCD: "$4.165/mes", pricePF: "$2.295/mes" },
  { name: "La Venezolana a Gasolina 4×2", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/T6-la-venezolana-de-jac-motors-venezuela-1024x427.jpg", tagline: "La pickup venezolana por excelencia", priceCD: "$2.972/mes", pricePF: "$1.653/mes" },
  { name: "La Venezolana a Diésel 4×2 y 4×4", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/jac_banners_la_venezolana_diesel_4x2_4x4-1024x427.jpg", tagline: "Mayor eficiencia para trabajo pesado", priceCD: "$3.214/mes", pricePF: "$1.801/mes" },
  { name: "Nevado Manual", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/vehiculo-nevado-js4-de-jac-motors-venezuela-1024x427.jpg", tagline: "El SUV familiar más consultado", priceCD: "$3.018/mes", pricePF: "$2.402/mes", featured: "MÁS CONSULTADO" },
  { name: "Nevado Automático", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/nevado-automatico-2025-de-jac-motors-venezuela-1024x427.jpg", tagline: "La misma potencia, en automático", priceCD: "Consultar", pricePF: "$2.677/mes" },
  { name: "Savanna", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/js8-Savanna-jac-motors-venezuela-1024x427.jpg", tagline: "Minivan espaciosa para familias grandes", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Élite", image: "https://jacvenezuela.com/wp-content/uploads/2024/09/vehiculo-elite-j7-jac-motors-venezuela-1024x427.jpg", tagline: "Sedán elegante con acabados premium", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Sunray V6 Pasajeros", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-171-1024x427.webp", tagline: "Van para transporte colectivo o corporativo", priceCD: "Consultar", pricePF: "Consultar" },
  { name: "Sunray V6 Carga", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-CARGA-1-1024x425.webp", tagline: "Van de carga versátil y eficiente", priceCD: "Consultar", pricePF: "Consultar" },
];

const camiones: CatalogModel[] = [
  { name: "Búfalo XL", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", pricePF: "Consultar" },
  { name: "Minero 14M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Minero-14m3-Capacidad-Tolva-1024x425.jpg", pricePF: "Consultar" },
  { name: "Minero 20M3", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Minero-20m3-Capacidad-Tolva-1024x425.webp", pricePF: "Consultar" },
  { name: "X100 Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/X100-FERRETERO-1024x427.webp", pricePF: "$1.419/mes" },
  { name: "Urban 3 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/URBAN-FERRETERO-1024x427.webp", pricePF: "$1.791/mes" },
  { name: "C 3500 Ferretero 4X4", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/C-3500-FERRETERO-4X4-1024x427.webp", pricePF: "$2.637/mes" },
  { name: "Doble Cabina Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/DOBLE-CABINA-FERRETERO-1024x427.webp", pricePF: "$2.255/mes" },
  { name: "6T Ferretero", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/6T-FERRETERO-1024x425.webp", pricePF: "$2.493/mes" },
  { name: "Búfalo 12 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/BUFALO-1024x425.webp", pricePF: "$2.604/mes" },
  { name: "Leyenda 20 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/LEYENDA-1024x425.webp", pricePF: "Consultar" },
  { name: "Cavalino", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CAVALINO-1024x425.webp", pricePF: "Consultar" },
  { name: "Chuto 4251 430 HP", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/CHUTO-4251-430-1024x425.webp", pricePF: "$6.363/mes" },
];

const utilitarios: CatalogModel[] = [
  { name: "Sunray V4 Ambulancia", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V4-AMBULANCIA-1024x425.webp", pricePF: "Consultar" },
  { name: "Compactador 5 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/Compactador-5-ton-1024x425.webp", pricePF: "Consultar" },
  { name: "Urban Chasis Largo 3 Ton", image: "https://jacvenezuela.com/wp-content/uploads/2025/01/Urban-Chasis-1024x576.webp", pricePF: "Consultar" },
  { name: "M4 Carroza", image: "https://jacvenezuela.com/wp-content/uploads/2025/03/SUNRAY-V6-171-1024x427.webp", pricePF: "Consultar", referentialImage: true },
];

const electricos: CatalogModel[] = [
  { name: "Voltio Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/VOLTIO-1024x427.webp", tagline: "Movilidad eléctrica urbana compacta", pricePF: "Consultar" },
  { name: "Electrón Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/ELECTRON-ELECTRICO-1-1024x427.webp", tagline: "Eficiencia eléctrica en diseño moderno", pricePF: "Consultar" },
  { name: "Nevado Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/jac_banners_Nevado_electrico-1024x427.jpg", tagline: "El SUV Nevado en versión 100% eléctrica", pricePF: "Consultar" },
  { name: "1073 Camión Eléctrico", image: "https://jacvenezuela.com/wp-content/uploads/2025/02/1073-ELECTRICO-1024x427.webp", tagline: "Solución eléctrica para carga comercial", pricePF: "Consultar" },
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
              onClick={() => setActive(tab)}
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
            <CatalogCard key={m.name} model={m} showCD={active === "PASAJEROS"} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModelsSection;
