const PISTE_ENDPOINTS = {
  production: {
    oauth: "https://oauth.piste.gouv.fr/api/oauth/token",
    api: "https://api.piste.gouv.fr",
  },
  sandbox: {
    oauth: "https://sandbox-oauth.piste.gouv.fr/api/oauth/token",
    api: "https://sandbox-api.piste.gouv.fr",
  },
} as const;

export type PisteEnv = keyof typeof PISTE_ENDPOINTS;

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cached: CachedToken | null = null;

function getEnv(): PisteEnv {
  const v = (process.env.PISTE_ENV ?? "production").toLowerCase();
  return v === "sandbox" ? "sandbox" : "production";
}

export function apiBase(): string {
  return PISTE_ENDPOINTS[getEnv()].api;
}

export async function getAccessToken(scope = "openid"): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expiresAt - 30 > now) return cached.accessToken;

  const clientId = process.env.PISTE_CLIENT_ID;
  const clientSecret = process.env.PISTE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PISTE_CLIENT_ID and PISTE_CLIENT_SECRET must be set in .env");
  }

  const url = PISTE_ENDPOINTS[getEnv()].oauth;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PISTE OAuth failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    accessToken: json.access_token,
    expiresAt: now + json.expires_in,
  };
  return cached.accessToken;
}

export async function pisteFetch(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<unknown> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }
  const url = path.startsWith("http") ? path : `${apiBase()}${path}`;
  const res = await fetch(url, { ...init, headers, body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PISTE ${init.method ?? "GET"} ${path} failed (${res.status}): ${text}`);
  }
  const ct = res.headers.get("content-type") ?? "";
  return ct.includes("application/json") ? res.json() : res.text();
}
