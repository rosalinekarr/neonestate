import { Auth } from '../hooks/useAuth'
import { buildRequest } from '../utils'

export interface Room {
	id: string;
	name: string;
	description: string;
	createdAt: number;
	memberCount: number;
}

export async function getRoom(auth: Auth, id: string): Promise<Room | null> {
	const response = await fetch(
		await buildRequest(auth, 'GET', `/api/rooms/${encodeURIComponent(id)}`),
	)
	if (response.status === 404) return null
	return response.json() as Promise<Room | null>
}

interface GetRoomsQueryOpts {
	name?: string
	sort?: 'member_count_desc'
}

export async function getRooms(auth: Auth, queryOpts: GetRoomsQueryOpts): Promise<Room[]> {
	const response = await fetch(
		await buildRequest(auth, 'GET', '/api/rooms', queryOpts),
	)
	if (response.status === 422) throw new Error('Invalid query')
	return response.json() as Promise<Room[]>
}

export async function createRoom(auth: Auth, room: Omit<Room, 'id' | 'createdAt' | 'memberCount'>): Promise<Room> {
	const response = await fetch(
		await buildRequest(auth, 'POST', '/api/rooms', room),
	)
	return response.json() as Promise<Room>
}