import { describe, expect, it } from "vitest";
import { vehicleFinancing } from "@/data/vehicleFinancing";

const pf = (id: string) =>
  vehicleFinancing.find((r) => r.planId === "pago-facil" && r.vehicleId === id)?.schedule.map((s) => s.amount);

describe("Pago Fácil — 05 de noviembre", () => {
  it("72 configuraciones", () =>
    expect(vehicleFinancing.filter((r) => r.planId === "pago-facil").length).toBe(72));
  it("Arena Sport Manual: firma 999,99, cuota 1.278,18, previo 3.007,10", () =>
    expect(pf("arena-sport-manual")).toEqual([999.99, 1278.18, 3007.1]));
  it("Titanio es nuevo: cuota 3.466,18", () => expect(pf("titanio")?.[1]).toBe(3466.18));
  it("ya no incluye 6T Brazo Hidráulico", () => expect(pf("6t-brazo-hidraulico")).toBeUndefined());
});
