import { Auth } from "../hooks/useAuth";
import { buildRequest } from "../utils";

export type RoomType = "classic" | "democracy";

export enum PermissionType {
  Ban = "ban",
  Censor = "censor",
  Edit = "edit",
}

export type Permission = {
  id: string;
  type: PermissionType;
};

export interface Room {
  id: string;
  backgroundPath?: string;
  createdAt: number;
  createdBy: string;
  description: string;
  memberCount: number;
  name: string;
  permissions: Permission[];
  type: RoomType;
}

export async function getRoom(auth: Auth, id: string): Promise<Room | null> {
  const response = await fetch(
    await buildRequest(auth, "GET", `/api/rooms/${encodeURIComponent(id)}`),
  );
  if (response.status === 404) return null;
  return response.json() as Promise<Room | null>;
}

interface GetRoomsQueryOpts {
  name?: string;
  sort?: "member_count_desc";
}

export async function getRooms(
  auth: Auth,
  queryOpts: GetRoomsQueryOpts,
): Promise<Room[]> {
  const response = await fetch(
    await buildRequest(auth, "GET", "/rooms", queryOpts),
  );
  if (response.status === 422) throw new Error("Invalid query");
  return response.json() as Promise<Room[]>;
}

export async function createRoom(
  auth: Auth,
  room: Omit<
    Room,
    "id" | "createdAt" | "createdBy" | "memberCount" | "permissions"
  >,
): Promise<Room> {
  const response = await fetch(
    await buildRequest(auth, "POST", "/rooms", room),
  );
  return response.json() as Promise<Room>;
}

export async function updateRoom(
  auth: Auth,
  id: string,
  roomData: Omit<
    Room,
    | "id"
    | "createdAt"
    | "createdBy"
    | "memberCount"
    | "name"
    | "permissions"
    | "type"
  >,
): Promise<Room> {
  const response = await fetch(
    await buildRequest(
      auth,
      "PUT",
      `/rooms/${encodeURIComponent(id)}`,
      roomData,
    ),
  );
  return response.json() as Promise<Room>;
}
