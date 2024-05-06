import { FirebaseApp } from 'firebase/app'
import {
	DocumentSnapshot,
	Timestamp,
	QuerySnapshot,
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

export interface Channel {
	id: string;
	name: string;
	description: string;
	createdAt: Timestamp;
}

export function listenForChannels(app: FirebaseApp, callback: (channel: Channel) => void) {
	const db = getFirestore(app)
	const q = query(
		collection(db, 'channels'),
	)
	return onSnapshot(q, (querySnapshot: QuerySnapshot): void => {
		querySnapshot.forEach((doc: DocumentSnapshot) => {
			callback({
				id: doc.id,
				...doc.data(),
			} as Channel)
		})
	})
}

export async function getChannelByName(app: FirebaseApp, name: string): Promise<Channel | null> {
	const db = getFirestore(app)
	const channels = await getDocs(
		query(
			collection(db, 'channels'),
			where('name', '==', name),
			orderBy('name'),
			limit(1),
		),
	)
	if (channels.docs.length !== 1) throw new Error('Channel not found')
	const doc = channels.docs[0]
	return {
		id: doc.id,
		...doc.data(),
	} as Channel
}

export async function listChannels(app: FirebaseApp): Promise<Channel[]> {
	const db = getFirestore(app)
	const channels = await getDocs(
		query(
			collection(db, 'channels'),
			orderBy('name'),
		),
	)
	return channels.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}) as Channel)
}

export async function createChannel(app: FirebaseApp, channel: Omit<Channel, 'id' | 'createdAt'>): Promise<void> {
	const db = getFirestore(app)
	const id = crypto.randomUUID()
	await setDoc(doc(db, 'channels', id), {
		...channel,
		createdAt: serverTimestamp(),
	})
}