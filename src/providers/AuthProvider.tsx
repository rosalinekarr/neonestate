import {User, getAuth, onAuthStateChanged} from 'firebase/auth'
import {ReactNode, createContext, useEffect, useState} from 'react'
import {useFirebaseApp} from '../hooks'
import {SignIn} from '../pages'
import { Loading } from '../components'

interface AuthProviderProps {
	children: ReactNode;
}

type Auth = User

export const AuthContext = createContext<Auth | null>(null)

export default function AuthProvider({children}: AuthProviderProps) {
	const app = useFirebaseApp()
	const [loading, setLoading] = useState<boolean>(true)
	const [auth, setAuth] = useState<User | null>(null)

	useEffect(() => {
		const auth = getAuth(app)
		onAuthStateChanged(auth, (newUser) => {
			setAuth(newUser)
			setLoading(false)
		})
	}, [app])

	if (loading) return <Loading />

	if (auth === null) return <SignIn />

	return (
		<AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
	)
}