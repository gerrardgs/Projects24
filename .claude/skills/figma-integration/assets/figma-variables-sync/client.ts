// Minimal client for GET /v1/files/:file_key/variables/local.
// Requirements (Figma docs, checked 2026-10-15): a Full seat in an Enterprise organisation, and a token with the
// file_variables:read scope. Personal access tokens go in the X-Figma-Token header.
import type { GetLocalVariablesResponse } from "@figma/rest-api-spec";

export const FIGMA_API = "https://api.figma.com";
const TIMEOUT_MS = 30_000;

export class FigmaApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "FigmaApiError";
    this.status = status;
  }
}

/** Explains the most common failures without echoing the token or the raw response body. */
function describeFailure(status: number, retryAfter: string | null): string {
  switch (status) {
    case 400:
      return "bad request: check the file key";
    case 401:
    case 403:
      return "not authorised: the token needs the file_variables:read scope, and the Variables API is limited to Full seats in Enterprise organisations";
    case 404:
      return "file not found, or the token's owner cannot open it";
    case 429:
      return `rate limited by Figma${retryAfter === null ? "" : `; retry after ${retryAfter} seconds`}`;
    default:
      return `unexpected response from Figma (HTTP ${status})`;
  }
}

export async function fetchLocalVariables(
  fileKey: string,
  token: string,
  options: { readonly baseUrl?: string; readonly signal?: AbortSignal } = {},
): Promise<GetLocalVariablesResponse> {
  if (!/^[A-Za-z0-9]+$/.test(fileKey)) throw new Error("file key may contain only letters and digits");
  if (token.trim() === "") throw new Error("FIGMA_TOKEN is empty");
  const url = new URL(`/v1/files/${fileKey}/variables/local`, options.baseUrl ?? FIGMA_API);
  const response = await fetch(url, {
    headers: { "X-Figma-Token": token, accept: "application/json" },
    signal: options.signal ?? AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new FigmaApiError(response.status, describeFailure(response.status, response.headers.get("retry-after")));
  }
  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || !("meta" in body)) {
    throw new FigmaApiError(response.status, "response does not look like a variables response");
  }
  const { meta } = body as { meta: unknown };
  if (typeof meta !== "object" || meta === null || !("variables" in meta) || !("variableCollections" in meta)) {
    throw new FigmaApiError(response.status, "response is missing meta.variables or meta.variableCollections");
  }
  return body as GetLocalVariablesResponse;
}
