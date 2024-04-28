import { useContext } from 'react'
import { AuthContext } from '../providers/AuthProvider'

export default function useCurrentUser() {
	const user = useContext(AuthContext)
	if (!user) throw new Error('Missing AuthContext: useCurrentUser must only be invoked within AuthProvider')
	return user
}