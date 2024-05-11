import { useContext } from 'react'
import { UsersContext } from '../providers/UsersProvider'

export default function useFetchUser() {
	const usersContext = useContext(UsersContext)
	if (!usersContext) throw new Error('Missing UsersContext: useFetchUser must only be invoked within UsersProvider')
	return usersContext.fetchUser
}