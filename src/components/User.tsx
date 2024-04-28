import { useEffect, useState } from 'react'
import { fetchProfile } from '../models/profile'
import { useFirebaseApp } from '../hooks'

interface UserProps {
	id: string;
}

export default function User({id}: UserProps) {
	const app = useFirebaseApp()
	const [username, setUsername] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		async function loadUser() {
			const profileData = await fetchProfile(app, id)
			if (!profileData) throw new Error(`User not found: ${id}`)
			setUsername(profileData.username)
			setIsLoading(false)
		}

		loadUser()
	}, [])

	if (isLoading) return <progress />

	return (
		<p className='post-author'>{username}</p>
	)
}