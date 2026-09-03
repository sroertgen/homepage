import { describe, it, expect } from "vitest";
import { legacySlugFor } from "../src/lib/legacy";

describe("legacySlugFor", () => {
  it("uses the folder name for index.md entries", () => {
    expect(legacySlugFor("src/content/posts/2023-03-18/index.md")).toBe("2023-03-18");
    expect(legacySlugFor("src/content/posts/2021-08-01/index.md")).toBe("2021-08-01");
    expect(legacySlugFor("src/content/posts/2023-02-08/index.md")).toBe("2023-02-08");
    expect(legacySlugFor("src/content/posts/2023-03-11/index.md")).toBe("2023-03-11");
    expect(legacySlugFor("src/content/posts/2023-06-30/index.md")).toBe("2023-06-30");
    expect(legacySlugFor("src/content/posts/rdf-reasoning-over-linked-curricula/index.md")).toBe(
      "rdf-reasoning-over-linked-curricula",
    );
  });

  it("uses the raw file name (without extension) for flat post files", () => {
    expect(legacySlugFor("src/content/posts/1_blog_run.md")).toBe("1_blog_run");
    expect(legacySlugFor("src/content/posts/2_added_projects.md")).toBe("2_added_projects");
    expect(legacySlugFor("src/content/posts/3_klimakrise.md")).toBe("3_klimakrise");
    expect(legacySlugFor("src/content/posts/4_frameworks_as_linked_data.md")).toBe("4_frameworks_as_linked_data");
    expect(legacySlugFor("src/content/posts/5_linking_the_data.md")).toBe("5_linking_the_data");
    expect(legacySlugFor("src/content/posts/6_reification.md")).toBe("6_reification");
    expect(legacySlugFor("src/content/posts/7_europass_vocabularies.md")).toBe("7_europass_vocabularies");
  });

  it("uses the raw file name (without extension) for project files", () => {
    expect(legacySlugFor("src/content/projects/1_edu-sharing-with-a-click.md")).toBe("1_edu-sharing-with-a-click");
    expect(legacySlugFor("src/content/projects/11_frameworks_as_linked_data.md")).toBe(
      "11_frameworks_as_linked_data",
    );
  });

  it("handles Windows-style separators", () => {
    expect(legacySlugFor("src\\content\\posts\\2023-03-18\\index.md")).toBe("2023-03-18");
  });
});
