import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:4000", fetchOptions:{credentials:"include"}, plugins:[jwtClient()] });
let apiToken:string|null=null;
export async function cacheApiToken(){try{const result:any=await authClient.token();if(result?.data?.token)apiToken=result.data.token}catch{}}
export function clearApiToken(){apiToken=null}
export async function getApiToken(){if(!apiToken)await cacheApiToken();return apiToken}
