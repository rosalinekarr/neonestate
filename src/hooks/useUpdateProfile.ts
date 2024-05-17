import { useContext } from 'react'
import { UsersContext } from '../providers/UsersProvider'
import { User } from '../models/users'

export default function useUpdateProfile(): (user: Omit<User, 'id' | 'createdAt'>) => Promise<void> {
	const usersContext = useContext(UsersContext)
	if (!usersContext) throw new Error('Missing UsersContext: useCurrentUser must only be invoked within UsersProvider')
	return usersContext.updateProfile
}