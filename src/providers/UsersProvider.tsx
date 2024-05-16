import {ReactNode, createContext, useEffect, useState} from 'react'
import {useAuth, useFirebaseApp} from '../hooks'
import { User, getProfile, getUser, listenForUserChanges, updateUser } from '../models/users'
import {CreateAccount, Profile} from '../pages'
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
	const app = useFirebaseApp()
	const auth = useAuth()
	const [users, setUsers] = useState<Record<string, User>>({})
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	async function loadCurrentUser() {
		const user = await getProfile(auth)
		if (user) {
			setUsers((prevUsers) => ({
				...prevUsers,
				[user.id]: user,
			}))
			setCurrentUser(user)
		}
		setIsLoading(false)
	}

	async function updateProfile({username}: Omit<User, 'id' | 'createdAt'>) {
		if (currentUser) {
			const updatedProfile = await updateUser(auth, currentUser.id, {username})
			setUsers((prevUsers) => ({
				...prevUsers,
				[currentUser.id]: updatedProfile,
			}))
			setCurrentUser(updatedProfile)
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
		const unsubscribe = listenForUserChanges(app, Object.keys(users), (user: User) => {
			setUsers((prevUsers) => ({
				...prevUsers,
				[user.id]: user,
			}))
		})

		return () => unsubscribe()
	}, [users])

	useEffect(() => {
		loadCurrentUser()
	}, [])

	if (isLoading) return <Loading />

	if (!currentUser) return <CreateAccount onSubmit={() => loadCurrentUser()} />

	return (
		<UsersContext.Provider value={{
			currentUser,
			fetchUser,
			updateProfile,
		}}>{currentUser ? children : <Profile />}</UsersContext.Provider>
	)
}