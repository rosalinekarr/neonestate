import { FirebaseApp } from 'firebase/app'
import {
	DocumentSnapshot,
	QuerySnapshot,
	collection,
	doc,
	getDocs,
	getFirestore,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
} from 'firebase/firestore'

export function listenForChannels(app: FirebaseApp, callback: (channel: string) => void) {
	const db = getFirestore(app)
	const q = query(
		collection(db, 'channels'),
	)
	return onSnapshot(q, (querySnapshot: QuerySnapshot): void => {
		querySnapshot.forEach((doc: DocumentSnapshot) => {
			callback(doc.data()?.name || '')
		})
	})
}

export async function listChannels(app: FirebaseApp): Promise<string[]> {
	const db = getFirestore(app)
	const channels = await getDocs(
		query(
			collection(db, 'channels'),
			orderBy('name'),
		),
	)
	return channels.docs.map((doc) => doc.data()?.name || '')
}

export async function saveChannel(app: FirebaseApp, channelName: string): Promise<void> {
	const db = getFirestore(app)
	const id = crypto.randomUUID()
	await setDoc(doc(db, 'channels', id), {
		createdAt: serverTimestamp(),
		name: channelName,
	})
}