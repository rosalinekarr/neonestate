import {ReactNode, createContext, useEffect, useState} from 'react'
import {useAuth, useFirebaseApp} from '../hooks'
import { User, fetchUser } from '../models/users'
import {Profile} from '../pages'
import { Loading } from '../components'

interface UserProviderProps {
	children: ReactNode;
}

interface UserContext {
	getUser: (id: string) => Promise<User | null>
}

export const UsersContext = createContext<UserContext | null>(null)

export default function UsersProvider({children}: UserProviderProps) {
	const app = useFirebaseApp()
	const auth = useAuth()
	const [users, setUsers] = useState<Record<string, User> | null>(null)

	async function getUser(id: string): Promise<User | null> {
		if (users && users[id]) return users[id]

		const user = await fetchUser(app, id)
		if (user)
			setUsers((prevUsers) => ({
				...prevUsers,
				[id]: user,
			}))

		return user
	}

	useEffect(() => {
		getUser(auth.uid)
	}, [])

	if (!users) return <Loading />

	return (
		<UsersContext.Provider value={{
			getUser,
		}}>{users[auth.uid] ? children : <Profile />}</UsersContext.Provider>
	)
}