// Converts Figma variables (REST API: GET /v1/files/:file_key/variables/local) into design tokens in the
// Design Tokens Community Group format 2025.10: one token file per collection and mode.
// Types come from Figma's official OpenAPI typings (@figma/rest-api-spec); this file has no runtime dependencies.
//
// Mapping decisions (documented in ../../SKILL.md section 4):
// - Variable "color/blue/600" in collection "Primitives" becomes token path "primitives.color.blue.600".
// - COLOR -> color (sRGB, with alpha when below 1). FLOAT -> dimension (px) or fontWeight or number, chosen
//   from the variable's scopes. STRING with only the FONT_FAMILY scope -> fontFamily.
// - Aliases become "{token.path}" references. Unsupported values are skipped with a warning, never guessed.

import type {
  GetLocalVariablesResponse,
  LocalVariable,
  LocalVariableCollection,
  RGBA,
  VariableAlias,
  VariableScope,
} from "@figma/rest-api-spec";

export type TokenTree = { [key: string]: TokenTree | unknown };

export interface ConversionResult {
  /** Output file name (`<collection>.<mode>.tokens.json`) mapped to its token tree. */
  readonly files: Map<string, TokenTree>;
  /** Variables that were skipped or need attention, with the reason. */
  readonly warnings: string[];
}

// Scopes whose values are lengths in pixels in Figma.
const DIMENSION_SCOPES: ReadonlySet<VariableScope> = new Set([
  "CORNER_RADIUS",
  "WIDTH_HEIGHT",
  "GAP",
  "STROKE_FLOAT",
  "EFFECT_FLOAT",
  "FONT_SIZE",
  "LINE_HEIGHT",
  "LETTER_SPACING",
  "PARAGRAPH_SPACING",
  "PARAGRAPH_INDENT",
]);

/** "Brand Colors" -> "brand-colors". Rejects names that would produce an empty or reserved segment. */
export function slug(segment: string): string {
  const result = segment
    .trim()
    .toLowerCase()
    .replace(/[{}.$]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  if (result === "") throw new Error(`name segment "${segment}" has no letters or digits`);
  return result;
}

/** Token path for a variable: collection name plus the variable's slash-separated name. */
export function tokenPath(collection: LocalVariableCollection, variable: LocalVariable): string {
  return [collection.name, ...variable.name.split("/")].map(slug).join(".");
}

const isAlias = (value: unknown): value is VariableAlias =>
  typeof value === "object" && value !== null && "type" in value && value.type === "VARIABLE_ALIAS";

const isRgba = (value: unknown): value is RGBA =>
  typeof value === "object" &&
  value !== null &&
  "r" in value &&
  "g" in value &&
  "b" in value &&
  ["r", "g", "b"].every((channel) => typeof (value as Record<string, unknown>)[channel] === "number");

const toByte = (channel: number): string => Math.round(Math.min(1, Math.max(0, channel)) * 255).toString(16).padStart(2, "0");

/** Figma colours are sRGB with channels from 0 to 1 (alpha optional). */
export function colorValue(color: RGBA): Record<string, unknown> {
  const components = [color.r, color.g, color.b].map((channel) => Math.round(channel * 10_000) / 10_000);
  const hex = `#${toByte(color.r)}${toByte(color.g)}${toByte(color.b)}`;
  const alpha = typeof color.a === "number" ? color.a : 1;
  return alpha < 1 ? { colorSpace: "srgb", components, alpha: Math.round(alpha * 10_000) / 10_000, hex } : { colorSpace: "srgb", components, hex };
}

type Mapped = { readonly type: string; readonly convert: (value: unknown) => unknown } | { readonly skip: string };

/** Chooses the DTCG type for a variable from its resolved type and scopes. */
export function mapType(variable: LocalVariable): Mapped {
  const scopes = new Set(variable.scopes);
  switch (variable.resolvedType) {
    case "COLOR":
      return { type: "color", convert: (value) => (isRgba(value) ? colorValue(value) : undefined) };
    case "FLOAT": {
      const number = (value: unknown) => (typeof value === "number" ? value : undefined);
      if (scopes.size > 0 && [...scopes].every((scope) => scope === "FONT_WEIGHT")) {
        return { type: "fontWeight", convert: number };
      }
      if (scopes.size > 0 && [...scopes].every((scope) => DIMENSION_SCOPES.has(scope))) {
        return {
          type: "dimension",
          convert: (value) => (typeof value === "number" ? { value, unit: "px" } : undefined),
        };
      }
      return { type: "number", convert: number };
    }
    case "STRING":
      if (scopes.size === 1 && scopes.has("FONT_FAMILY")) {
        return { type: "fontFamily", convert: (value) => (typeof value === "string" ? value : undefined) };
      }
      return { skip: "STRING variables are only exported when their only scope is FONT_FAMILY" };
    case "BOOLEAN":
      return { skip: "BOOLEAN variables have no DTCG token type" };
  }
}

function setPath(tree: TokenTree, path: string, token: Record<string, unknown>): void {
  const segments = path.split(".");
  let node = tree;
  for (const segment of segments.slice(0, -1)) {
    const next = node[segment];
    if (next !== undefined && (typeof next !== "object" || next === null || "$value" in next)) {
      throw new Error(`token path "${path}" collides with an existing token at "${segment}"`);
    }
    node[segment] ??= {};
    node = node[segment] as TokenTree;
  }
  const leaf = segments.at(-1) ?? "";
  if (node[leaf] !== undefined) throw new Error(`token path "${path}" is produced by two variables; rename one in Figma`);
  node[leaf] = token;
}

export function convertVariables(response: GetLocalVariablesResponse): ConversionResult {
  const { variables, variableCollections } = response.meta;
  const files = new Map<string, TokenTree>();
  const warnings: string[] = [];
  const pathById = new Map<string, string>();
  const collectionOf = (variable: LocalVariable) => variableCollections[variable.variableCollectionId];

  for (const variable of Object.values(variables)) {
    const collection = collectionOf(variable);
    if (collection !== undefined && !variable.deletedButReferenced) pathById.set(variable.id, tokenPath(collection, variable));
  }

  for (const collection of Object.values(variableCollections).sort((a, b) => a.name.localeCompare(b.name))) {
    if (collection.remote) {
      warnings.push(`collection "${collection.name}": remote (from a library); convert it from its source file`);
      continue;
    }
    for (const mode of collection.modes) {
      const tree: TokenTree = {};
      for (const variableId of collection.variableIds) {
        const variable = variables[variableId];
        if (variable === undefined || variable.deletedButReferenced) continue;
        const path = pathById.get(variable.id) ?? tokenPath(collection, variable);
        const mapped = mapType(variable);
        if ("skip" in mapped) {
          warnings.push(`${path}: skipped, ${mapped.skip}`);
          continue;
        }
        const raw = variable.valuesByMode[mode.modeId] ?? variable.valuesByMode[collection.defaultModeId];
        let value: unknown;
        if (isAlias(raw)) {
          const target = pathById.get(raw.id);
          if (target === undefined) {
            warnings.push(`${path} (${mode.name}): skipped, alias to a variable outside this file (${raw.id})`);
            continue;
          }
          value = `{${target}}`;
        } else {
          value = mapped.convert(raw);
        }
        if (value === undefined) {
          warnings.push(`${path} (${mode.name}): skipped, unsupported value ${JSON.stringify(raw)}`);
          continue;
        }
        const token: Record<string, unknown> = { $type: mapped.type, $value: value };
        if (variable.description.trim() !== "") token.$description = variable.description.trim();
        token.$extensions = {
          "com.figma": { variableId: variable.id, scopes: variable.scopes, ...(variable.codeSyntax.WEB ? { codeSyntax: variable.codeSyntax.WEB } : {}) },
        };
        setPath(tree, path, token);
      }
      files.set(`${slug(collection.name)}.${slug(mode.name)}.tokens.json`, tree);
    }
  }
  return { files, warnings };
}

/** Accepts a file key or any Figma file URL (design, file, proto, board, slides) and returns the key. */
export function parseFileKey(input: string): string {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9]{10,}$/.test(trimmed)) return trimmed;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`"${input}" is neither a Figma file key nor a URL`);
  }
  if (url.hostname !== "figma.com" && !url.hostname.endsWith(".figma.com")) throw new Error(`"${url.hostname}" is not a Figma host`);
  const match = /^\/(?:design|file|proto|board|slides)\/([A-Za-z0-9]+)/.exec(url.pathname);
  if (match?.[1] === undefined) throw new Error(`no file key found in "${input}"`);
  return match[1];
}
