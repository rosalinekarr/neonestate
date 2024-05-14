import { FirebaseApp } from 'firebase/app'
import {
	DocumentSnapshot,
	QuerySnapshot,
	Timestamp,
	collection,
	getFirestore,
	onSnapshot,
	query,
	where,
} from 'firebase/firestore'

const MS_PER_S = 1000

export interface Post {
	id: string;
	body: string;
	roomId: string;
	createdAt: number;
	authorId: string;
}

export function listenForPostsInRoom(app: FirebaseApp, roomId: string, callback: (post: Post) => void) {
	const db = getFirestore(app)
	const q = query(
		collection(db, 'posts'),
		where('roomId', '==', roomId),
		where('createdAt', '>', Timestamp.now()),
	)
	return onSnapshot(q, (querySnapshot: QuerySnapshot): void => {
		querySnapshot.forEach((doc: DocumentSnapshot) => {
			callback({
				id: doc.id,
				...doc.data(),
			} as Post)
		})
	})
}

export function listenForPostsByAuthor(app: FirebaseApp, authorId: string, callback: (post: Post) => void) {
	const db = getFirestore(app)
	const q = query(
		collection(db, 'posts'),
		where('authorId', '==', authorId),
		where('createdAt', '>', Timestamp.now()),
	)
	return onSnapshot(q, (querySnapshot: QuerySnapshot): void => {
		querySnapshot.forEach((doc: DocumentSnapshot) => {
			callback({
				id: doc.id,
				...doc.data(),
			} as Post)
		})
	})
}

export interface GetPostsOpts {
	authorId?: string;
	createdBefore?: number;
	roomId?: string;
}

export async function getPosts(auth: string, {authorId, createdBefore, roomId}: GetPostsOpts): Promise<Post[]> {
	const url = new URL('/api/posts', import.meta.env.VITE_API_BASE_URL)
	if (authorId) url.searchParams.set('authorId', encodeURIComponent(authorId))
	if (createdBefore) url.searchParams.set('createdBefore', (createdBefore / MS_PER_S).toFixed())
	if (roomId) url.searchParams.set('roomId', encodeURIComponent(roomId))
	const response = await fetch(url, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	return response.json() as Promise<Post[]>
}

export async function createPost(auth: string, post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
	const url = new URL('/api/posts', import.meta.env.VITE_API_BASE_URL)
	const response = await fetch(url, {
		body: JSON.stringify(post),
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
			'Content-Type': 'application/json',
		}),
		method: 'POST',
	})
	return response.json() as Promise<Post>
}