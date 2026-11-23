import { describe, expect, it } from "vitest";
import { findVehicle } from "@/data/vehicles";
import { vehicleFinancing } from "@/data/vehicleFinancing";

describe("Pionero — variantes independientes", () => {
  it("Pionero Chasis 5 Ton tiene su propia ficha", () => {
    expect(findVehicle("Pionero Chasis 5 Ton")?.id).toBe("pionero-chasis-5-ton");
  });
  it("Pionero Ferretero 5 Ton no se confunde con el 4x4", () => {
    expect(findVehicle("Pionero Ferretero 5 Ton")?.id).toBe("pionero-ferretero-5-ton");
    expect(findVehicle("Pionero Ferretero 4x4")?.id).toBe("pionero-ferretero-4x4");
  });
  it("en el respaldo local solo tienen montos de catálogos verificados", () => {
    const rows = vehicleFinancing.filter((r) =>
      ["pionero-chasis-5-ton", "pionero-ferretero-5-ton"].includes(r.vehicleId)
    );
    expect(rows.map((r) => r.planId).sort()).toEqual(["facilito", "facilito", "llevatelo-fiao", "llevatelo-fiao", "pago-facil", "pago-facil"]);
    expect(rows.find((r) => r.planId === "facilito" && r.vehicleId === "pionero-chasis-5-ton")?.schedule[0].amount).toBe(1593.51);
  });
});