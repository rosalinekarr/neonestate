import { getAuth, signOut } from 'firebase/auth'
import { FormEvent, useState } from 'react'
import { useCurrentUser, useFirebaseApp, useUpdateProfile } from '../hooks'
import { CheckIcon, CloseIcon } from '../components/icons'
import styles from './Profile.module.css'
import { Button, IconButton, InputField, Loading } from '../components'
import { useNavigate } from 'react-router-dom'

interface ProfileFormProps {
	onClose?: () => void;
}

export function ProfileForm({onClose}: ProfileFormProps) {
	const user = useCurrentUser()
	// const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '')
	const [username, setUsername] = useState<string>(user?.username || '')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | undefined>(undefined)
	const updateProfile = useUpdateProfile()

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		setError(undefined)
		try {
			await updateProfile({
				username,
			})
		} catch (e: any) {
			setError(e)
		}
		setIsLoading(false)

		onClose && onClose()
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
				error={error}
				name='username'
				onChange={(newUsername) => setUsername(newUsername)}
				placeholder='Johnny Mnemonic'
				value={username}
			/>
			<IconButton icon={CheckIcon} type='submit' />
			{onClose && <IconButton icon={CloseIcon} onClick={() => onClose()} />}
		</form>
	)
}

interface ProfileInfoProps {
	onEdit: () => void;
}

function ProfileInfo({onEdit}: ProfileInfoProps) {
	const user = useCurrentUser()
	const app = useFirebaseApp()
	const navigate = useNavigate()
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false)

	async function handleSignOut() {
		setIsSigningOut(true)
		const auth = getAuth(app)
		await signOut(auth)
		navigate('/')
	}

	if (isSigningOut) return <Loading />

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
	const [isEditing, setIsEditing] = useState<boolean>(false)

	return (
		<div className={styles.profile}>
			<h2>Edit Profile</h2>
			{isEditing ?
				<ProfileForm
					onClose={() => setIsEditing(false)}
				/>
				:
				<ProfileInfo
					onEdit={() => setIsEditing(true)}
				/>
			}
		</div>
	)
}