import { FirebaseApp } from 'firebase/app'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'

export interface User {
	id: string;
	username: string;
}

export async function fetchUser(app: FirebaseApp, id: string): Promise<User | null> {
	const db = getFirestore(app)
	const snapshot = await getDoc(doc(db, 'users', id))
	if (snapshot.exists()) return {
		id: id,
		username: snapshot.get('username'),
	}
	return null
}

export async function updateUser(app: FirebaseApp, id: string, user: Omit<User, 'id'>) {
	const db = getFirestore(app)
	await setDoc(doc(db, 'users', id), user)
}