import { useContext } from "react";
import { RoomsContext } from "../providers/RoomsProvider";

export default function useStartRoom() {
  const roomsContext = useContext(RoomsContext);
  if (!roomsContext)
    throw new Error(
      "Missing RoomsContext: useCreateRoom must only be invoked within RoomsContext",
    );
  return roomsContext.startRoom;
}
