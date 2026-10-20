import { describe, it, expect } from "vitest";
import { vehicleFinancing } from "@/data/vehicleFinancing";

/* Importes del catálogo CREDIJAC 35X35 del 12 de octubre (copiados del PDF). */
const rows = vehicleFinancing.filter((f) => f.planId === "credijac-35x35");
const amounts = (id: string) =>
  rows.find((r) => r.vehicleId === id)?.schedule.map((s) => s.amount);

describe("CrediJAC 35x35 — 12 de octubre", () => {
  it("tiene 62 configuraciones sin duplicados", () => {
    expect(rows).toHaveLength(62);
    expect(new Set(rows.map((r) => r.vehicleId)).size).toBe(62);
  });
  it("Arena Sport Manual (pág. 2)", () => {
    expect(amounts("arena-sport-manual")).toEqual([1442.3, 2887.9, 499.2, 437.9]);
  });
  it("Sunray V6 Motorhome (pág. 44)", () => {
    expect(amounts("sunray-v6-motorhome")).toEqual([7718.5, 13135.3, 2671.3, 2343.2]);
  });
  it("Leyenda Brazo Hidráulico (pág. 121)", () => {
    expect(amounts("leyenda-brazo-hidraulico")).toEqual([12583.2, 21125.0, 3483.0, 8179.0]);
  });
});
