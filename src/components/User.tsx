import { useEffect, useState } from 'react'
import { useFetchUser, useImage } from '../hooks'
import type {User} from '../models/users'
import styles from './User.module.css'
import Loading from './Loading'

interface UserProps {
	id: string;
}

export default function User({id}: UserProps) {
	const fetchUser = useFetchUser()
	const avatarUrl = useImage(`avatar/${id}`)
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		async function loadUser() {
			const user = await fetchUser(id)
			if (!user) throw new Error(`User not found: ${id}`)
			setUser(user)
		}

		loadUser()
	}, [])

	if (!user || !avatarUrl) return <Loading size="small" />

	return (
		<div className={styles.user}>
			<img src={avatarUrl} alt={`Avatar for ${user.username}`} className={styles.avatar} />
			<p className={styles.username}>{user.username}</p>
		</div>
	)
}