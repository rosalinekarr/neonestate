import { Room } from '../models/rooms'
import { User } from '../models/users'

interface Permissions {
	canEditRoom: boolean;
}

export default function usePermissions(room: Room | null, user: User): Permissions {
	return {
		canEditRoom: user?.id === room?.createdBy,
	}
}