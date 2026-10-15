// A realistic GET /v1/files/:file_key/variables/local response, type-checked against Figma's official
// typings (@figma/rest-api-spec), so `npm run typecheck` fails if the fixture drifts from the real API shape.
import type { GetLocalVariablesResponse, LocalVariable, VariableScope } from "@figma/rest-api-spec";

const variable = (
  id: string,
  name: string,
  variableCollectionId: string,
  resolvedType: LocalVariable["resolvedType"],
  valuesByMode: LocalVariable["valuesByMode"],
  scopes: VariableScope[] = ["ALL_SCOPES"],
  extra: Partial<LocalVariable> = {},
): LocalVariable => ({
  id,
  name,
  key: `key-${id}`,
  variableCollectionId,
  resolvedType,
  valuesByMode,
  remote: false,
  description: "",
  hiddenFromPublishing: false,
  scopes,
  codeSyntax: {},
  ...extra,
});

const P = "VariableCollectionId:1:1"; // Primitives, one mode
const T = "VariableCollectionId:1:2"; // Theme, Light and Dark
const R = "VariableCollectionId:9:9"; // remote library collection
const alias = (id: string) => ({ type: "VARIABLE_ALIAS" as const, id });

const variables: LocalVariable[] = [
  variable("VariableID:1:10", "color/neutral/0", P, "COLOR", { "1:0": { r: 1, g: 1, b: 1, a: 1 } }),
  variable("VariableID:1:11", "color/neutral/900", P, "COLOR", { "1:0": { r: 0.0667, g: 0.0941, b: 0.1529, a: 1 } }),
  variable("VariableID:1:12", "color/blue/600", P, "COLOR", { "1:0": { r: 0.1412, g: 0.3412, b: 0.8392, a: 1 } }, ["ALL_FILLS", "STROKE_COLOR"], {
    description: "Primary brand blue",
    codeSyntax: { WEB: "var(--color-blue-600)" },
  }),
  variable("VariableID:1:13", "color/overlay", P, "COLOR", { "1:0": { r: 0, g: 0, b: 0, a: 0.5 } }),
  variable("VariableID:1:20", "space/4", P, "FLOAT", { "1:0": 16 }, ["GAP", "WIDTH_HEIGHT"]),
  variable("VariableID:1:21", "radius/Medium", P, "FLOAT", { "1:0": 8 }, ["CORNER_RADIUS"]),
  variable("VariableID:1:22", "font/weight/bold", P, "FLOAT", { "1:0": 700 }, ["FONT_WEIGHT"]),
  variable("VariableID:1:23", "opacity/disabled", P, "FLOAT", { "1:0": 0.4 }, ["OPACITY"]),
  variable("VariableID:1:24", "font/family/sans", P, "STRING", { "1:0": "Inter" }, ["FONT_FAMILY"]),
  variable("VariableID:1:25", "copy/brand name", P, "STRING", { "1:0": "Example" }, ["TEXT_CONTENT"]),
  variable("VariableID:1:26", "flags/beta", P, "BOOLEAN", { "1:0": true }, []),
  variable("VariableID:1:30", "surface/default", T, "COLOR", { "2:0": alias("VariableID:1:10"), "2:1": alias("VariableID:1:11") }),
  variable("VariableID:1:31", "text/default", T, "COLOR", { "2:0": alias("VariableID:1:11"), "2:1": alias("VariableID:1:10") }),
  variable("VariableID:1:32", "action/default", T, "COLOR", { "2:0": alias("VariableID:1:12"), "2:1": alias("VariableID:1:12") }),
  variable("VariableID:1:33", "action/tint", T, "COLOR", {
    "2:0": { color: alias("VariableID:1:12"), opacity: 20 },
    "2:1": { color: alias("VariableID:1:12"), opacity: 30 },
  }),
  variable("VariableID:1:34", "brand/accent", T, "COLOR", { "2:0": alias("VariableID:77:1"), "2:1": alias("VariableID:77:1") }),
  variable("VariableID:1:35", "legacy/old", T, "COLOR", { "2:0": { r: 1, g: 0, b: 0, a: 1 } }, ["ALL_SCOPES"], { deletedButReferenced: true }),
  variable("VariableID:9:1", "library/red", R, "COLOR", { "9:0": { r: 1, g: 0, b: 0, a: 1 } }, ["ALL_SCOPES"], { remote: true }),
];

export const fixture = {
  status: 200,
  error: false,
  meta: {
    variables: Object.fromEntries(variables.map((entry) => [entry.id, entry])),
    variableCollections: {
      [P]: {
        id: P,
        name: "Primitives",
        key: "key-primitives",
        modes: [{ modeId: "1:0", name: "Value" }],
        defaultModeId: "1:0",
        remote: false,
        hiddenFromPublishing: false,
        variableIds: variables.filter((entry) => entry.variableCollectionId === P).map((entry) => entry.id),
      },
      [T]: {
        id: T,
        name: "Theme",
        key: "key-theme",
        modes: [
          { modeId: "2:0", name: "Light" },
          { modeId: "2:1", name: "Dark" },
        ],
        defaultModeId: "2:0",
        remote: false,
        hiddenFromPublishing: false,
        variableIds: variables.filter((entry) => entry.variableCollectionId === T).map((entry) => entry.id),
      },
      [R]: {
        id: R,
        name: "Library",
        key: "key-library",
        modes: [{ modeId: "9:0", name: "Default" }],
        defaultModeId: "9:0",
        remote: true,
        hiddenFromPublishing: false,
        variableIds: ["VariableID:9:1"],
      },
    },
  },
} satisfies GetLocalVariablesResponse;
