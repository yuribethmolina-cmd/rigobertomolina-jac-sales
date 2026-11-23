import { describe, it, expect } from "vitest";
import { vehicleFinancing } from "@/data/vehicleFinancing";

/* Importes de los catálogos del 12 de octubre (copiados del PDF). */
const amounts = (plan: string, id: string) =>
  vehicleFinancing
    .find((r) => r.planId === plan && r.vehicleId === id)
    ?.schedule.map((s) => s.amount);
const count = (plan: string) => vehicleFinancing.filter((r) => r.planId === plan).length;

describe("Facilito de JAC — 05 de noviembre", () => {
  it("72 configuraciones con ficha", () => expect(count("facilito")).toBe(72));
  it("Arena Sport Manual (pág. 2)", () =>
    expect(amounts("facilito", "arena-sport-manual")).toEqual([799.18, 799.18, 2887.92, 799.18]));
  it("Volkán Mezclador 9M3", () =>
    expect(amounts("facilito", "volkan-mezclador-9m3")).toEqual([6049.62, 6049.62, 17165.58, 6049.62]));
  it("Nevado Pro (pág. 6) es nuevo", () =>
    expect(amounts("facilito", "nevado-pro")).toEqual([1323.12, 1323.12, 4203.67, 1323.12]));
  it("ya no incluye 6T Brazo Hidráulico", () =>
    expect(amounts("facilito", "6t-brazo-hidraulico")).toBeUndefined());
});

describe("Llévatelo Fiao — 05 de noviembre", () => {
  it("64 configuraciones con ficha", () => expect(count("llevatelo-fiao")).toBe(64));
  it("retira la 6T Brazo Hidráulico", () =>
    expect(amounts("llevatelo-fiao", "6t-brazo-hidraulico")).toBeUndefined());
  it("Nevado Pro (pág. 6): 15 cuotas de 1.493,13", () =>
    expect(amounts("llevatelo-fiao", "nevado-pro")).toEqual([1599.81, 1599.81, 5503.28, 1493.13]));
  it("Arena Sport Manual (pág. 2): 15 cuotas de 927,67", () => {
    expect(amounts("llevatelo-fiao", "arena-sport-manual")).toEqual([993.95, 993.95, 3621.0, 927.67]);
    const row = vehicleFinancing.find((r) => r.planId === "llevatelo-fiao" && r.vehicleId === "arena-sport-manual");
    expect(row?.schedule.find((s) => s.type === "ORDINARY")?.count).toBe(15);
  });
  it("no incluye Minero 28M3 (ausente del PDF)", () =>
    expect(amounts("llevatelo-fiao", "minero-28m3")).toBeUndefined());
});
