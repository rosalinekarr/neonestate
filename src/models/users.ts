export interface User {
	id: string;
	username: string;
	createdAt: number;
}

export async function getProfile(auth: string): Promise<User | null> {
	const response = await fetch('/api/profile', {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	if (response.status === 404) return null
	return response.json() as Promise<User>
}

export async function getUser(auth: string, id: string): Promise<User | null> {
	const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	return response.json() as Promise<User>
}

export async function createUser(auth: string, user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
	const response = await fetch('/api/users', {
		body: JSON.stringify(user),
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
			'Content-Type': 'application/json',
		}),
		method: 'POST',
	})
	return response.json() as Promise<User>
}

export async function updateUser(auth: string, id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
	const response = await fetch(`/api/users/${encodeURIComponent(id)}`, {
		body: JSON.stringify(user),
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
			'Content-Type': 'application/json',
		}),
		method: 'PUT',
	})
	return response.json() as Promise<User>
}