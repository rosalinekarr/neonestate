import { useContext, useEffect } from "react";
import { RoomsContext } from "../providers/RoomsProvider";
import { sortBy } from "../utils";

export default function usePopularRooms() {
  const roomsContext = useContext(RoomsContext);
  if (!roomsContext)
    throw new Error(
      "Missing RoomsContext: usePopularRooms must only be invoked within RoomsContext",
    );

  const { fetchPopularRooms, rooms } = roomsContext;
  const popularRooms = sortBy(rooms, (room) => -room.memberCount);

  useEffect(() => {
    fetchPopularRooms();
  }, []);

  return popularRooms;
}
