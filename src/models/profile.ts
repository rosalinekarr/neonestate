import { FirebaseApp } from 'firebase/app'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'

export interface Profile {
	username: string;
}

export async function fetchProfile(app: FirebaseApp, id: string): Promise<Profile | null> {
	const db = getFirestore(app)
	const snapshot = await getDoc(doc(db, 'users', id))
	if (snapshot.exists()) return {
		username: snapshot.get('username'),
	}
	return null
}

export async function updateProfile(app: FirebaseApp, id: string, profile: Profile) {
	const db = getFirestore(app)
	await setDoc(doc(db, 'users', id), profile)
}