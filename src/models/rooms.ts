import { Auth } from '../hooks/useAuth'
import { buildRequest } from '../utils'

export interface Room {
	id: string;
	name: string;
	description: string;
	createdAt: number;
}

export async function getRoom(auth: Auth, id: string): Promise<Room | null> {
	const response = await fetch(
		await buildRequest(auth, 'GET', `/api/rooms/${encodeURIComponent(id)}`),
	)
	if (response.status === 404) return null
	return response.json() as Promise<Room | null>
}

export async function searchRooms(auth: Auth, name: string): Promise<Room[]> {
	const response = await fetch(
		await buildRequest(auth, 'GET', '/api/rooms', {name}),
	)
	return response.json() as Promise<Room[]>
}

export async function createRoom(auth: Auth, room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
	const response = await fetch(
		await buildRequest(auth, 'POST', '/api/rooms', room),
	)
	return response.json() as Promise<Room>
}