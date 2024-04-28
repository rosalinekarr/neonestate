import { getAuth, signOut } from 'firebase/auth'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth, useFirebaseApp, useGetUser } from '../hooks'
import { User, updateUser } from '../models/users'

interface ProfileFormProps {
	onClose: () => void;
	user: User;
}

function ProfileForm({onClose, user}: ProfileFormProps) {
	const app = useFirebaseApp()
	// const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '')
	const [username, setUsername] = useState<string>(user?.username || '')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await updateUser(app, user.id, {
			username,
		})
		setIsLoading(false)

		onClose()
	}

	if (isLoading) return <progress />

	return (
		<form onSubmit={handleSubmit}>
			{/* <label htmlFor='avatar'>Avatar</label>
			<input
				type='file'
				id='avatar'
				name='avatar'
				value={avatarUrl}
				onChange={(e) => setAvatarUrl(e.target.value)}
			/> */}
			<label htmlFor='name'>Name</label>
			<input
				type='text'
				id='name'
				name='name'
				placeholder='Johnny Neonmonic'
				value={username}
				onChange={(e) => setUsername(e.target.value)}
			/>
			<button
				onClick={() => onClose}
			>Cancel</button>
			<button type='submit'>Save</button>
		</form>
	)
}

interface ProfileInfoProps {
	onEdit: () => void;
	user: User;
}

function ProfileInfo({onEdit, user}: ProfileInfoProps) {
	const app = useFirebaseApp()

	function handleSignOut() {
		const auth = getAuth(app)
		signOut(auth)
	}

	return (
		<div>
			{/* <img src={user.avatarUrl} alt='Profile Picture' /> */}
			<p>{user.username}</p>
			<button onClick={() => onEdit()}>Edit</button>
			<button onClick={() => handleSignOut()}>Sign out</button>
		</div>
	)
}

export default function Profile() {
	const auth = useAuth()
	const getUser = useGetUser()
	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [user, setUser] = useState<User | null>(null)

	useEffect(() => {
		async function loadUser() {
			setUser(
				await getUser(auth.uid),
			)
		}

		loadUser()
	}, [auth])

	if (!user) return (
		<progress />
	)

	return (
		<div className='profile'>
			<h2>Edit Profile</h2>
			{isEditing ?
				<ProfileForm
					onClose={() => setIsEditing(false)}
					user={user}
				/>
				:
				<ProfileInfo
					onEdit={() => setIsEditing(true)}
					user={user}
				/>
			}
		</div>
	)
}