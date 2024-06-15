import { Auth } from "../hooks/useAuth";

export async function buildEventSource(auth: Auth): Promise<EventSource> {
  const authToken = await auth();

  const url = new URL(`${import.meta.env.VITE_API_BASE_URL}/events`);
  url.searchParams.set("lastTs", Math.floor(Date.now() / 1000).toString());
  url.searchParams.set("token", authToken);

  return new EventSource(url);
}
