import { buildRequest } from "../utils";
import { Auth } from "../hooks/useAuth";

export interface User {
  id: string;
  avatarPath: string;
  username: string;
  createdAt: number;
}

export async function getUser(auth: Auth, id: string): Promise<User | null> {
  const response = await fetch(
    await buildRequest(auth, "GET", `/users/${encodeURIComponent(id)}`),
  );
  if (response.status === 404) return null;
  return response.json() as Promise<User>;
}

export async function getProfile(auth: Auth): Promise<User | null> {
  const response = await fetch(await buildRequest(auth, "GET", "/profile"));
  if (response.status === 404) return null;
  return response.json() as Promise<User | null>;
}

export async function updateProfile(
  auth: Auth,
  user: Partial<Omit<User, "id" | "createdAt">>,
): Promise<User> {
  const response = await fetch(
    await buildRequest(auth, "POST", "/profile", user),
  );
  if (response.status === 422) {
    const { error: msg } = await response.json();
    throw new Error(msg);
  }
  return response.json() as Promise<User>;
}
