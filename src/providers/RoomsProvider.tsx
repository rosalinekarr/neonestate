import { ReactNode, createContext, useMemo, useState } from "react";
import { Room, createRoom, getRooms, updateRoom } from "../models/rooms";
import { useAuth } from "../hooks";

interface RoomsProviderProps {
  children: ReactNode;
}

interface RoomsContext {
  editRoom: (
    id: string,
    room: Omit<Room, "id" | "createdAt" | "createdBy" | "memberCount" | "name">,
  ) => Promise<void>;
  fetchPopularRooms: () => Promise<void>;
  fetchRoom: (name: string) => Promise<void>;
  roomsByName: Record<string, Room>;
  rooms: Room[];
  startRoom: (
    room: Omit<Room, "id" | "createdAt" | "createdBy" | "memberCount">,
  ) => Promise<void>;
}

export const RoomsContext = createContext<RoomsContext | null>(null);

export default function RoomsProvider({ children }: RoomsProviderProps) {
  const auth = useAuth();
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [idsByName, setIdsByName] = useState<Record<string, string>>({});

  async function fetchPopularRooms() {
    const newRooms = await getRooms(auth, { sort: "member_count_desc" });
    setRooms(
      (prevRooms): Record<string, Room> => ({
        ...prevRooms,
        ...Object.fromEntries(newRooms.map((room) => [room.id, room])),
      }),
    );
  }

  async function editRoom(
    roomId: string,
    roomData: Omit<
      Room,
      "id" | "createdAt" | "createdBy" | "memberCount" | "name"
    >,
  ) {
    const updatedRoom: Room = await updateRoom(auth, roomId, roomData);

    setRooms((prevRooms) => ({
      ...prevRooms,
      [roomId]: updatedRoom,
    }));
    setIdsByName((prevIdsByName) => ({
      ...prevIdsByName,
      [updatedRoom.name]: roomId,
    }));
  }

  async function fetchRoom(name: string): Promise<void> {
    let room = (await getRooms(auth, { name })).find((r) => r.name === name);

    if (room) {
      setRooms((prevRooms) => ({
        ...prevRooms,
        [room.id]: room,
      }));
      setIdsByName((prevIdsByName) => ({
        ...prevIdsByName,
        [room.name]: room.id,
      }));
    }
  }

  async function startRoom(
    roomData: Omit<Room, "id" | "createdAt" | "createdBy" | "memberCount">,
  ): Promise<void> {
    const newRoom: Room = await createRoom(auth, roomData);

    setRooms((prevRooms) => ({
      ...prevRooms,
      [newRoom.id]: newRoom,
    }));
    setIdsByName((prevIdsByName) => ({
      ...prevIdsByName,
      [newRoom.name]: newRoom.id,
    }));
  }

  const roomsByName = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(idsByName).map(([name, id]: [string, string]) => [
          name,
          rooms[id],
        ]),
      ),
    [idsByName, rooms],
  );

  return (
    <RoomsContext.Provider
      value={{
        editRoom,
        fetchPopularRooms,
        fetchRoom,
        roomsByName,
        rooms: Object.values(rooms),
        startRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}
