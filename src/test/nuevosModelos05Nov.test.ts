import { describe, expect, it } from "vitest";
import { findVehicle } from "@/data/vehicles";

describe("Catálogo 05/11 — modelos nuevos con ficha propia", () => {
  it("Nevado Pro tiene su propia ficha", () => {
    expect(findVehicle("Nevado Pro")?.id).toBe("nevado-pro");
  });
  it("Titanio tiene su propia ficha", () => {
    expect(findVehicle("Titanio")?.id).toBe("titanio");
  });
  it("Pionero Transporte de Pollito Bebé no se confunde con otros Pionero", () => {
    expect(findVehicle("Pionero Transporte de Pollito Bebé con Calefacción")?.id).toBe(
      "pionero-transporte-pollito-bebe"
    );
  });
  it("Búfalo Transporte de Pollito Bebé tiene su propia ficha", () => {
    expect(findVehicle("Búfalo Transporte de Pollito Bebé con Calefacción")?.id).toBe(
      "bufalo-transporte-pollito-bebe"
    );
  });
  it("Contenedor Refrigerado 40 Pies tiene su propia ficha", () => {
    expect(findVehicle("Contenedor Refrigerado 40 Pies con Puerta Lateral")?.id).toBe(
      "contenedor-refrigerado-40-pies"
    );
  });
});
