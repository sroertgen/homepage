import * as yaml from "js-yaml";

/** Parses YAML text and returns the array stored under `key`, throwing if it is missing or not a list. */
export function parseYamlKey(text: string, key: string): Record<string, unknown>[] {
  const doc = yaml.load(text) as Record<string, unknown>;
  const value = doc?.[key];
  if (!Array.isArray(value)) {
    throw new Error(`portfolio.yaml: expected a list under "${key}"`);
  }
  return value as Record<string, unknown>[];
}
