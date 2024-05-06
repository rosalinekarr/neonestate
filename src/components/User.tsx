import { useEffect, useState } from 'react'
import { useGetUser } from '../hooks'
import type {User} from '../models/users'
import styles from './User.module.css'
import Loading from './Loading'

interface UserProps {
	id: string;
}

export default function User({id}: UserProps) {
	const getUser = useGetUser()
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		async function loadUser() {
			const user = await getUser(id)
			if (!user) throw new Error(`User not found: ${id}`)
			setUser(user)
		}

		loadUser()
	}, [])

	if (!user) return <Loading />

	return (
		<p className={styles.user}>{user.username}</p>
	)
}