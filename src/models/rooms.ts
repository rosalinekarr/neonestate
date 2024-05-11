export interface Room {
	id: string;
	name: string;
	description: string;
	createdAt: number;
}

export async function getRoom(auth: string, id: string): Promise<Room | null> {
	const response = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	if (response.status === 404) return null
	return response.json() as Promise<Room | null>
}

export async function searchRooms(auth: string, query: string): Promise<Room[]> {
	const response = await fetch(`/api/rooms?name=${encodeURIComponent(query)}`, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	return response.json() as Promise<Room[]>
}

export async function createRoom(auth: string, room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
	const response = await fetch('/api/rooms', {
		body: JSON.stringify(room),
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
			'Content-Type': 'application/json',
		}),
		method: 'POST',
	})
	return response.json() as Promise<Room>
}