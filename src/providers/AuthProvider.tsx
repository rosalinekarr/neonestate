import {User as FirebaseUser, getAuth, onAuthStateChanged} from 'firebase/auth'
import {ReactNode, createContext, useEffect, useState} from 'react'
import {useFirebaseApp} from '../hooks'
import {SignIn} from '../pages'
import { Loading } from '../components'

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext<FirebaseUser | null>(null)

export default function AuthProvider({children}: AuthProviderProps) {
	const app = useFirebaseApp()
	const [loading, setLoading] = useState<boolean>(true)
	const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)

	useEffect(() => {
		const auth = getAuth(app)
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (user) setFirebaseUser(user)
			setLoading(false)
		})

		return () => unsub()
	}, [app])

	if (loading) return <Loading />

	if (firebaseUser === null) return <SignIn />

	return (
		<AuthContext.Provider value={firebaseUser}>{children}</AuthContext.Provider>
	)
}