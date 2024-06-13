import { FirebaseApp } from "firebase/app";
import {
  QuerySnapshot,
  collection,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
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
    await buildRequest(auth, "GET", `/api/users/${encodeURIComponent(id)}`),
  );
  if (response.status === 404) return null;
  return response.json() as Promise<User>;
}

export function listenForUserChanges(
  app: FirebaseApp,
  ids: string[],
  callback: (u: User) => void,
): () => void {
  if (ids.length === 0) return () => {};
  const db = getFirestore(app);
  const usersQuery = query(collection(db, "users"), where("id", "in", ids));
  return onSnapshot(usersQuery, (qSnapshot: QuerySnapshot) => {
    qSnapshot.forEach((doc) => {
      const data = doc.data();
      callback({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.seconds,
      } as User);
    });
  });
}

export async function createUser(
  auth: Auth,
  user: Omit<User, "id" | "createdAt">,
): Promise<User> {
  const response = await fetch(
    await buildRequest(auth, "POST", "/api/users", user),
  );
  if (response.status === 422) {
    const { error: msg } = await response.json();
    throw new Error(msg);
  }
  return response.json() as Promise<User>;
}

export async function updateUser(
  auth: Auth,
  id: string,
  user: Partial<Omit<User, "id" | "createdAt">>,
): Promise<User> {
  const response = await fetch(
    await buildRequest(
      auth,
      "POST",
      `/api/users/${encodeURIComponent(id)}`,
      user,
    ),
  );
  if (response.status === 422) {
    const { error: msg } = await response.json();
    throw new Error(msg);
  }
  return response.json() as Promise<User>;
}

export function isProfileComplete(user: User | null): user is User {
  return (
    typeof user?.username === "string" && typeof user?.avatarPath === "string"
  );
}
