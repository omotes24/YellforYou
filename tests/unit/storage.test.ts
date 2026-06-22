import { describe, expect, it } from "vitest";

import { defaultStorage, upsertCompany } from "@/lib/storage/browser-store";
import { createEmptyCompanyProfile } from "@/lib/schemas/interview";

describe("browser storage helpers", () => {
  it("keeps the active company at the front", () => {
    const first = {
      ...createEmptyCompanyProfile(),
      id: "company-a",
      label: "A",
      companyName: "A社",
    };
    const second = {
      ...createEmptyCompanyProfile(),
      id: "company-b",
      label: "B",
      companyName: "B社",
    };

    const storage = {
      ...defaultStorage,
      companies: [first, second],
    };

    const next = upsertCompany(storage, {
      ...second,
      targetRole: "更新済みコース",
    });

    expect(next.companies.map((company) => company.id)).toEqual([
      "company-b",
      "company-a",
    ]);
    expect(next.companies[0].targetRole).toBe("更新済みコース");
  });
});
