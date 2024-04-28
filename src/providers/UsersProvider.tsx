import {ReactNode, createContext, useState} from 'react'
import {useFirebaseApp} from '../hooks'
import { User, fetchUser } from '../models/users'

interface UserProviderProps {
	children: ReactNode;
}

interface UserContext {
	getUser: (id: string) => Promise<User>
}

export const UsersContext = createContext<UserContext | null>(null)

export default function UsersProvider({children}: UserProviderProps) {
	const app = useFirebaseApp()
	const [users, setUsers] = useState<Record<string, User>>({})

	async function getUser(id: string): Promise<User> {
		if (users[id]) return users[id]

		const user = await fetchUser(app, id)
		if (!user) throw new Error('User not found')
		setUsers((prevUsers) => ({
			...prevUsers,
			[id]: user,
		}))

		return user
	}

	return (
		<UsersContext.Provider value={{
			getUser,
		}}>{children}</UsersContext.Provider>
	)
}