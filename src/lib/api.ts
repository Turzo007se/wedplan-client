import {getApiToken,cacheApiToken} from "@/lib/auth-client";
export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? await getApiToken() : null;
  const send=(value:string|null)=>{const headers=new Headers(options.headers);headers.set("Content-Type","application/json");if(value)headers.set("Authorization",`Bearer ${value}`);return fetch(`${API}${path}`, { ...options, headers, cache: "no-store",credentials:"include" })};
  let response = await send(token);
  if(response.status===401&&typeof window!=="undefined"){
    try{await cacheApiToken();const renewed=await getApiToken();if(renewed)response=await send(renewed)}catch{}
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Something went wrong. Please try again.");
  return body as T;
}
