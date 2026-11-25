import { describe, expect, it } from "vitest";
import { prevues } from "./publications";

describe("prevues", () => {
  it("ne compte pas les publications reportées dans le total à publier", () => {
    const publications = [
      { statut: "a-preparer" as const },
      { statut: "tourne" as const },
      { statut: "publie" as const },
      { statut: "reporte" as const },
    ];
    expect(prevues(publications)).toHaveLength(3);
  });
});
