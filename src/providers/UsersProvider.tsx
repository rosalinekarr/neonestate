import {ReactNode, createContext, useContext, useEffect, useState} from 'react'
import {useAuth, useFirebaseApp} from '../hooks'
import { User, createUser, getUser, listenForUserChanges, updateUser } from '../models/users'
import {CreateAccount} from '../pages'
import { AuthContext } from './AuthProvider'
import { Loading } from '../components'

interface UserProviderProps {
	children: ReactNode;
}

interface UserContext {
	currentUser: User;
	fetchUser: (id: string) => Promise<User | null>;
	updateProfile: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
}

export const UsersContext = createContext<UserContext | null>(null)

export default function UsersProvider({children}: UserProviderProps) {
	const app = useFirebaseApp()
	const auth = useAuth()
	const firebaseUser = useContext(AuthContext)
	const [users, setUsers] = useState<Record<string, User>>({})
	const [currentUser, setCurrentUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	async function createProfile({username}: Omit<User, 'id' | 'createdAt'>) {
		const newProfile = await createUser(auth, {username})
		setUsers((prevUsers) => ({
			...prevUsers,
			[newProfile.id]: newProfile,
		}))
	}

	async function updateProfile({username}: Omit<User, 'id' | 'createdAt'>) {
		if (!firebaseUser) throw new Error('Missing AuthContext: UsersProvider must only be used within AuthProvider')
		const updatedProfile = await updateUser(auth, firebaseUser.uid, {username})
		setUsers((prevUsers) => ({
			...prevUsers,
			[firebaseUser.uid]: updatedProfile,
		}))
	}

	async function fetchUser(id: string): Promise<User | null> {
		if (users[id]) return users[id]

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
		async function loadCurrentUser() {
			if (!firebaseUser) throw new Error('Missing AuthContext: UsersProvider must only be used within AuthProvider')
			const user = await fetchUser(firebaseUser.uid)
			setCurrentUser(user)
			setIsLoading(false)
		}

		loadCurrentUser()
	}, [])

	if (isLoading) return <Loading />

	if (!currentUser) return <CreateAccount onSubmit={createProfile} />

	return (
		<UsersContext.Provider value={{
			currentUser,
			fetchUser,
			updateProfile,
		}}>{children}</UsersContext.Provider>
	)
}