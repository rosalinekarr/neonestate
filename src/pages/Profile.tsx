import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCurrentUser, useFirebaseApp } from '../hooks'
import { Profile as UserProfile, fetchProfile, updateProfile } from '../models/profile'

interface ProfileFormProps {
	onClose: () => void;
	profile: UserProfile | null;
	userId: string;
}

function ProfileForm({onClose, profile, userId}: ProfileFormProps) {
	const app = useFirebaseApp()
	// const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '')
	const [username, setUsername] = useState<string>(profile?.username || '')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await updateProfile(app, userId, {
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
				type='reset'
				onClick={() => onClose}
			>Cancel</button>
			<button type='submit'>Save</button>
		</form>
	)
}

interface ProfileInfoProps {
	editable: boolean;
	onEdit: () => void;
	profile: UserProfile;
}

function ProfileInfo({editable, onEdit, profile}: ProfileInfoProps) {
	return (
		<div>
			{/* <img src={user.avatarUrl} alt='Profile Picture' /> */}
			<p>{profile.username}</p>
			{editable && <button onClick={() => onEdit()}>Edit</button>}
		</div>
	)
}

export default function Profile() {
	const app = useFirebaseApp()
	const {userId} = useParams()
	const currentUser = useCurrentUser()
	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [profile, setProfile] = useState<UserProfile | null>(null)

	const id = userId || currentUser.uid

	useEffect(() => {
		async function loadProfile() {
			setIsLoading(true)
			setProfile(
				await fetchProfile(app, id),
			)
			setIsLoading(false)
		}

		loadProfile()
	}, [currentUser, userId])

	if (isLoading) return (
		<progress />
	)

	return (
		<div className='profile'>
			<h2>Edit Profile</h2>
			{isEditing || !profile ?
				<ProfileForm
					onClose={() => setIsEditing(false)}
					profile={profile}
					userId={id}
				/>
				:
				<ProfileInfo
					editable={id === currentUser.uid}
					onEdit={() => setIsEditing(true)}
					profile={profile}
				/>
			}
		</div>
	)
}