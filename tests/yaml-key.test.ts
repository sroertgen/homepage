import { describe, it, expect } from "vitest";
import { parseYamlKey } from "../src/lib/yaml-key";

describe("parseYamlKey", () => {
  it("returns the list under an existing key", () => {
    const text = "projects:\n  - id: a\n  - id: b\nroles:\n  - id: c\n";
    expect(parseYamlKey(text, "projects")).toEqual([{ id: "a" }, { id: "b" }]);
    expect(parseYamlKey(text, "roles")).toEqual([{ id: "c" }]);
  });

  it("throws with a message containing the key name when the key is missing", () => {
    const text = "projects:\n  - id: a\n";
    expect(() => parseYamlKey(text, "roles")).toThrow(/roles/);
  });
});
