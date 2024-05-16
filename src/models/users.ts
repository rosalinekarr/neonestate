import { FirebaseApp } from 'firebase/app'
import { QuerySnapshot, collection, getFirestore, onSnapshot, query, where } from 'firebase/firestore'

export interface User {
	id: string;
	username: string;
	createdAt: number;
}

export async function getProfile(auth: string): Promise<User | null> {
	const url = new URL('/api/profile', import.meta.env.VITE_API_BASE_URL)
	const response = await fetch(url, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	if (response.status === 404) return null
	return response.json() as Promise<User>
}

export async function getUser(auth: string, id: string): Promise<User | null> {
	const url = new URL(`/api/users/${encodeURIComponent(id)}`, import.meta.env.VITE_API_BASE_URL)
	const response = await fetch(url, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	return response.json() as Promise<User>
}

export function listenForUserChanges(app: FirebaseApp, ids: string[], callback: (u: User) => void): () => void {
	if (ids.length === 0) return () => {}
	const db = getFirestore(app)
	const usersQuery = query(collection(db, 'users'), where('id', 'in', ids))
	return onSnapshot(usersQuery, (qSnapshot: QuerySnapshot) => {
		qSnapshot.docs.forEach((doc) => {
			callback(doc.data() as User)
		})
	})
}

export async function createUser(auth: string, user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
	const url = new URL('/api/users', import.meta.env.VITE_API_BASE_URL)
	const response = await fetch(url, {
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
	const url = new URL(`/api/users/${encodeURIComponent(id)}`, import.meta.env.VITE_API_BASE_URL)
	const response = await fetch(url, {
		body: JSON.stringify(user),
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
			'Content-Type': 'application/json',
		}),
		method: 'PUT',
	})
	return response.json() as Promise<User>
}