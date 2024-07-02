import { PermissionType, Room } from "../models/rooms";

interface Permissions {
  canBanRoom: boolean;
  canCensorRoom: boolean;
  canEditRoom: boolean;
}

export default function useRoomPermissions(room: Room | null): Permissions {
  return {
    canBanRoom: !!room?.permissions.find(
      ({ type }) => type === PermissionType.Ban,
    ),
    canCensorRoom: !!room?.permissions.find(
      ({ type }) => type === PermissionType.Censor,
    ),
    canEditRoom: !!room?.permissions.find(
      ({ type }) => type === PermissionType.Edit,
    ),
  };
}
