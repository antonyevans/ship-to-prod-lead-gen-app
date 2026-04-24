import { createClient } from "@insforge/sdk";

function getConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
  const serviceKey = process.env.INSFORGE_SERVICE_KEY;
  if (!baseUrl || !serviceKey) {
    throw new Error(
      "Missing InsForge config. Set NEXT_PUBLIC_INSFORGE_URL and INSFORGE_SERVICE_KEY.",
    );
  }
  return { baseUrl, serviceKey };
}

export function createInsforgeServerClient(options?: { accessToken?: string }) {
  const { baseUrl, serviceKey } = getConfig();
  return createClient({
    baseUrl,
    anonKey: serviceKey,
    isServerMode: true,
    ...(options?.accessToken ? { edgeFunctionToken: options.accessToken } : {}),
  });
}

export function getInsforgeServerClient() {
  return createInsforgeServerClient();
}
