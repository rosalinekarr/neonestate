import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {ReactNode, createContext, useEffect, useState} from 'react'
import {useFirebaseApp} from '../hooks'
import {SignIn} from '../pages'

interface User {
	uid: string;
}

interface UserProviderProps {
	children: ReactNode;
}

export const UserContext = createContext<User | null>(null)

export default function UserProvider({children}: UserProviderProps) {
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

	if (loading) return <p>Loading</p>

	if (!user) return <SignIn />

	return (
		<UserContext.Provider value={user}>{children}</UserContext.Provider>
	)
}