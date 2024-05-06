import { getAuth, signOut } from 'firebase/auth'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth, useFirebaseApp, useGetUser } from '../hooks'
import { User, updateUser } from '../models/users'
import { CheckIcon, CloseIcon } from '../components/icons'
import styles from './Profile.module.css'
import { Button, IconButton, InputField, Loading } from '../components'

interface ProfileFormProps {
	onClose: () => void;
	user: User | null;
}

function ProfileForm({onClose, user}: ProfileFormProps) {
	const app = useFirebaseApp()
	const auth = useAuth()
	// const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '')
	const [username, setUsername] = useState<string>(user?.username || '')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await updateUser(app, auth.uid, {
			username,
		})
		setIsLoading(false)

		onClose()
	}

	if (isLoading) return <Loading />

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
			<InputField
				name='username'
				onChange={(newUsername) => setUsername(newUsername)}
				placeholder='Johnny Mnemonic'
				value={username}
			/>
			<IconButton icon={CheckIcon} type='submit' />
			{user && <IconButton icon={CloseIcon} onClick={() => onClose} />}
		</form>
	)
}

interface ProfileInfoProps {
	onEdit: () => void;
	user: User | null;
}

function ProfileInfo({onEdit, user}: ProfileInfoProps) {
	const app = useFirebaseApp()

	function handleSignOut() {
		const auth = getAuth(app)
		signOut(auth)
	}

	if (!user) return <Loading />

	return (
		<div>
			{/* <img src={user.avatarUrl} alt='Profile Picture' /> */}
			<p>{user?.username || ''}</p>
			<Button onClick={() => onEdit()}>Edit</Button>
			<Button onClick={() => handleSignOut()}>Sign out</Button>
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
			const user = await getUser(auth.uid)
			if (user) {
				setUser(user)
			} else {
				setIsEditing(true)
			}
		}

		loadUser()
	}, [auth])

	return (
		<div className={styles.profile}>
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