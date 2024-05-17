import { FirebaseApp } from 'firebase/app'
import {
	QuerySnapshot,
	Timestamp,
	collection,
	getFirestore,
	onSnapshot,
	orderBy,
	query,
	where,
} from 'firebase/firestore'
import { buildRequest } from '../utils'
import { Auth } from '../hooks/useAuth'

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

export async function getPosts(auth: Auth, queryOpts: GetPostsOpts): Promise<Post[]> {
	const response = await fetch(
		await buildRequest(auth, 'GET', '/api/posts', queryOpts),
	)
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
		orderBy('createdAt', 'desc'),
	)
	return onSnapshot(postsQuery, (qSnapshot: QuerySnapshot) => {
		qSnapshot.forEach((doc) => {
			const data = doc.data()
			callback({
				id: doc.id,
				...data,
				createdAt: data.createdAt.seconds,
			} as Post)
		})
	})
}

export async function createPost(auth: Auth, post: Omit<Post, 'id' | 'authorId' | 'createdAt'>): Promise<Post> {
	const response = await fetch(
		await buildRequest(auth, 'POST', '/api/posts', post),
	)
	return response.json() as Promise<Post>
}