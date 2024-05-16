import { FirebaseApp } from 'firebase/app'
import {
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

export interface ListenPostsOpts {
	createdAfter?: number;
	roomIds?: string[];
}

export function listenForNewPosts(app: FirebaseApp, roomIds: string[], callback: (p: Post) => void): () => void {
	const db = getFirestore(app)
	const postsQuery = query(
		collection(db, 'posts'),
		where('createdAt', '>', Timestamp.now()),
		where('roomId', 'in', roomIds),
	)
	return onSnapshot(postsQuery, (qSnapshot: QuerySnapshot) => {
		qSnapshot.docs.forEach((doc) => {
			callback(doc.data() as Post)
		})
	})
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