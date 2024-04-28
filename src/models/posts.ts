import { FirebaseApp } from 'firebase/app'
import {
	DocumentSnapshot,
	QuerySnapshot,
	Timestamp,
	collection,
	doc,
	getDocs,
	getFirestore,
	limit,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	where,
} from 'firebase/firestore'

export interface Post {
	id: string;
	body: string;
	channelId: string;
	createdAt: Timestamp;
	userId: string;
}

export function listenForNewPosts(app: FirebaseApp, channelId: string, callback: (post: Post) => void) {
	const db = getFirestore(app)
	const q = query(
		collection(db, 'posts'),
		where('channelId', '==', channelId),
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

export async function listPostsForChannel(app: FirebaseApp, channelId: string, ts: Timestamp): Promise<Post[]> {
	const db = getFirestore(app)
	const posts = await getDocs(
		query(
			collection(db, 'posts'),
			where('channelId', '==', channelId),
			where('createdAt', '<', ts),
			orderBy('createdAt', 'desc'),
			limit(3),
		),
	)
	return posts.docs.reverse().map((doc) => ({
		id: doc.id,
		...doc.data(),
	}) as Post)
}

export async function createPost(app: FirebaseApp, post: Omit<Post, 'id' | 'createdAt'>): Promise<void> {
	const db = getFirestore(app)
	const id = crypto.randomUUID()
	await setDoc(doc(db, 'posts', id), {
		createdAt: serverTimestamp(),
		...post,
	})
}