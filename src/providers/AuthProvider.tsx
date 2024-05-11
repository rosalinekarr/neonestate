import {getAuth, onAuthStateChanged} from 'firebase/auth'
import {ReactNode, createContext, useEffect, useState} from 'react'
import {useFirebaseApp} from '../hooks'
import {SignIn} from '../pages'
import { Loading } from '../components'

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthContext = createContext<string | null>(null)

export default function AuthProvider({children}: AuthProviderProps) {
	const app = useFirebaseApp()
	const [loading, setLoading] = useState<boolean>(true)
	const [authToken, setAuthToken] = useState<string | null>(null)

	useEffect(() => {
		const auth = getAuth(app)
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				const token = await user.getIdToken()
				setAuthToken(token)
			}
			setLoading(false)
		})
	}, [app])

	if (loading) return <Loading />

	if (authToken === null) return <SignIn />

	return (
		<AuthContext.Provider value={authToken}>{children}</AuthContext.Provider>
	)
}