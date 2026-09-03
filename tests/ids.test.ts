import { describe, it, expect } from "vitest";
import { generateContentId } from "../src/lib/ids";

describe("generateContentId", () => {
  it("uses the folder name for index.md", () => {
    expect(generateContentId({ entry: "2023-06-30/index.md" })).toBe("2023-06-30");
    expect(generateContentId({ entry: "rdf-reasoning-over-linked-curricula/index.md" })).toBe("rdf-reasoning-over-linked-curricula");
  });
  it("strips numeric prefix and turns underscores into dashes", () => {
    expect(generateContentId({ entry: "5_linking_the_data.md" })).toBe("linking-the-data");
    expect(generateContentId({ entry: "1_edu-sharing-with-a-click.md" })).toBe("edu-sharing-with-a-click");
    expect(generateContentId({ entry: "10_klimakrise.md" })).toBe("klimakrise");
  });
});
