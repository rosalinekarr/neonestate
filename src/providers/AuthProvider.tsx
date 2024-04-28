import {User, getAuth, onAuthStateChanged} from 'firebase/auth'
import {ReactNode, createContext, useEffect, useState} from 'react'
import {useFirebaseApp} from '../hooks'
import {SignIn} from '../pages'

interface UserProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext<User | null>(null)

export default function AuthProvider({children}: UserProviderProps) {
	const app = useFirebaseApp()
	const [loading, setLoading] = useState<boolean>(true)
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		const auth = getAuth(app)
		onAuthStateChanged(auth, (newUser) => {
			setUser(newUser)
			setLoading(false)
		})
	}, [app])

	if (loading) return <progress />

	if (user === null) return <SignIn />

	return (
		<AuthContext.Provider value={user}>{children}</AuthContext.Provider>
	)
}