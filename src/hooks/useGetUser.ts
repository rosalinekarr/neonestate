import { useContext } from 'react'
import { UsersContext } from '../providers/UsersProvider'

export default function useGetUser() {
	const usersContext = useContext(UsersContext)
	if (!usersContext) throw new Error('Missing UsersContext: useGetUser must only be invoked within UsersProvider')
	return usersContext.getUser
}