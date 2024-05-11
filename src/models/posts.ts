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
	const url = new URL('/api/posts')
	if (authorId) url.searchParams.set('authorId', encodeURI(authorId))
	if (createdBefore) url.searchParams.set('createdBefore', new Date(createdBefore).toISOString())
	if (roomId) url.searchParams.set('roomId', encodeURI(roomId))
	const response = await fetch(url, {
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
		}),
	})
	return response.json() as Promise<Post[]>
}

export async function createPost(auth: string, post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
	const response = await fetch('/api/posts', {
		body: JSON.stringify(post),
		headers: new Headers({
			Authorization: `Bearer ${auth}`,
			'Content-Type': 'application/json',
		}),
		method: 'POST',
	})
	return response.json() as Promise<Post>
}