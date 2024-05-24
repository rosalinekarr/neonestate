import { getAuth, signOut } from 'firebase/auth'
import { ChangeEvent, FormEvent, useState } from 'react'
import { useCurrentUser, useFirebaseApp, useImage, useUpdateProfile, useUploadAvatar } from '../hooks'
import { CheckIcon, CloseIcon } from '../components/icons'
import styles from './Profile.module.css'
import { Button, IconButton, InputField, Loading } from '../components'
import { useNavigate } from 'react-router-dom'

interface ProfileFormProps {
	onClose?: () => void;
}

export function ProfileForm({onClose}: ProfileFormProps) {
	const user = useCurrentUser()
	const [username, setUsername] = useState<string>(user?.username || '')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | undefined>(undefined)
	const uploadAvatar = useUploadAvatar()
	const updateProfile = useUpdateProfile()

	async function handleUploadAvatar(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.files?.length !== 1) return
		const file = e.target.files[0] || null

		await uploadAvatar(file)
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		setError(undefined)
		try {
			await updateProfile({
				username,
			})

			onClose && onClose()
		} catch (e: any) {
			setError(e.toString())
			setIsLoading(false)
		}
	}

	if (isLoading) return <Loading />

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor='avatar'>Avatar</label>
			<input
				accept='image/jpeg,image/png,image/webp'
				type='file'
				id='avatar'
				name='avatar'
				onChange={handleUploadAvatar}
			/>
			<InputField
				error={error}
				name='username'
				onChange={(newUsername) => setUsername(newUsername)}
				placeholder='Johnny Mnemonic'
				value={username}
			/>
			<IconButton icon={CheckIcon} type='submit' aria-label='Submit' />
			{onClose && <IconButton icon={CloseIcon} onClick={() => onClose()} aria-label='Close' />}
		</form>
	)
}

interface ProfileInfoProps {
	onEdit: () => void;
}

export function ProfileInfo({onEdit}: ProfileInfoProps) {
	const user = useCurrentUser()
	const app = useFirebaseApp()
	const avatarUrl = useImage(`avatar/${user.id}`)
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
			{avatarUrl && <img src={avatarUrl} className={styles.avatar} />}
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