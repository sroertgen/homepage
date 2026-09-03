import { describe, it, expect } from "vitest";
import { formatDate } from "../src/lib/dates";

describe("formatDate", () => {
  it("formats a date as day month year in en-GB style", () => {
    expect(formatDate(new Date("2025-06-05T00:00:00Z"))).toBe("05 June 2025");
  });
});
