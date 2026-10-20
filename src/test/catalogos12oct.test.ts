import { describe, it, expect } from "vitest";
import { vehicleFinancing } from "@/data/vehicleFinancing";

/* Importes de los catálogos del 12 de octubre (copiados del PDF). */
const amounts = (plan: string, id: string) =>
  vehicleFinancing
    .find((r) => r.planId === plan && r.vehicleId === id)
    ?.schedule.map((s) => s.amount);
const count = (plan: string) => vehicleFinancing.filter((r) => r.planId === plan).length;

describe("Facilito de JAC — 12 de octubre", () => {
  it("66 configuraciones con ficha", () => expect(count("facilito")).toBe(66));
  it("Arena Sport Manual (pág. 2)", () =>
    expect(amounts("facilito", "arena-sport-manual")).toEqual([799.2, 799.2, 2887.9, 799.2]));
  it("Volkán Mezclador 9M3 (pág. 136)", () =>
    expect(amounts("facilito", "volkan-mezclador-9m3")).toEqual([6049.6, 6049.6, 17165.6, 6049.6]));
});

describe("Llévatelo Fiao — 12 de octubre", () => {
  it("58 configuraciones con ficha", () => expect(count("llevatelo-fiao")).toBe(58));
  it("Arena Sport Manual (pág. 2): 15 cuotas de 927,7", () => {
    expect(amounts("llevatelo-fiao", "arena-sport-manual")).toEqual([994.0, 994.0, 3621.0, 927.7]);
    const row = vehicleFinancing.find((r) => r.planId === "llevatelo-fiao" && r.vehicleId === "arena-sport-manual");
    expect(row?.schedule.find((s) => s.type === "ORDINARY")?.count).toBe(15);
  });
  it("no incluye Minero 28M3 (ausente del PDF)", () =>
    expect(amounts("llevatelo-fiao", "minero-28m3")).toBeUndefined());
});
