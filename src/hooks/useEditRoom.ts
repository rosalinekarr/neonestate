import { useContext } from "react";
import { RoomsContext } from "../providers/RoomsProvider";

export default function useEditRoom() {
  const roomsContext = useContext(RoomsContext);
  if (!roomsContext)
    throw new Error(
      "Missing RoomsContext: useEditRoom must only be invoked within RoomsContext",
    );
  return roomsContext.editRoom;
}
