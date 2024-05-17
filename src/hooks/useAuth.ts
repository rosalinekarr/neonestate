import { useContext } from 'react'
import { AuthContext } from '../providers/AuthProvider'

export type Auth = () => Promise<string>

export default function useAuth(): Auth {
	const auth = useContext(AuthContext)
	if (!auth) throw new Error('Missing AuthContext: useAuth must only be invoked within AuthProvider')
	return () => auth.getIdToken()
}