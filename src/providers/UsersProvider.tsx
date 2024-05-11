import {ReactNode, createContext, useEffect, useState} from 'react'
import {useAuth} from '../hooks'
import { User, createUser, getProfile, getUser, updateUser } from '../models/users'
import {Profile} from '../pages'
import { Loading } from '../components'

interface UserProviderProps {
	children: ReactNode;
}

interface UserContext {
	currentUser: User;
	fetchUser: (id: string) => Promise<User | null>;
	updateProfile: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

export const UsersContext = createContext<UserContext | null>(null)

export default function UsersProvider({children}: UserProviderProps) {
	const auth = useAuth()
	const [users, setUsers] = useState<Record<string, User> | null>(null)
	const [currentUser, setCurrentUser] = useState<User | null>(null)

	async function updateProfile({username}: Omit<User, 'id' | 'createdAt'>) {
		if (currentUser) {
			const updatedProfile = await updateUser(auth, currentUser.id, {username})
			setUsers((prevUsers) => ({
				...prevUsers,
				[currentUser.id]: updatedProfile,
			}))
			setCurrentUser(updatedProfile)
		} else {
			const newProfile = await createUser(auth, {username})
			setUsers((prevUsers) => ({
				...prevUsers,
				[newProfile.id]: newProfile,
			}))
			setCurrentUser(newProfile)
		}
	}

	async function fetchUser(id: string): Promise<User | null> {
		if (users && users[id]) return users[id]

		const user = await getUser(auth, id)
		if (user)
			setUsers((prevUsers) => ({
				...prevUsers,
				[id]: user,
			}))

		return user
	}

	useEffect(() => {
		async function loadSelf() {
			const user = await getProfile(auth)
			if (user) {
				setCurrentUser(user)
				setUsers((prevUsers) => ({
					...prevUsers,
					[user.id]: user,
				}))
			}
		}

		loadSelf()
	}, [])

	if (!(currentUser && users)) return <Loading />

	return (
		<UsersContext.Provider value={{
			currentUser,
			fetchUser,
			updateProfile,
		}}>{currentUser ? children : <Profile />}</UsersContext.Provider>
	)
}