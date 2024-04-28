import { useContext } from 'react'
import { AuthContext } from '../providers/AuthProvider'

export default function useAuth() {
	const user = useContext(AuthContext)
	if (!user) throw new Error('Missing AuthContext: useAuth must only be invoked within AuthProvider')
	return user
}