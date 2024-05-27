import { FormEvent, useState } from 'react'
import { AvatarField, Button, Loading, TextField } from '../components'
import { User } from '../models/users'
import styles from './CreateAccount.module.css'

interface CreateAccountProps {
	onSubmit: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
}

export default function CreateAccount({onSubmit}: CreateAccountProps) {
	const [avatarPath, setAvatarPath] = useState<string>('')
	const [username, setUsername] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | undefined>(undefined)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		setError(undefined)
		try {
			await onSubmit({
				avatarPath,
				username,
			})
		} catch (e: any) {
			setError(e.message)
		}
		setIsLoading(false)
	}

	if (isLoading) return <Loading />

	return (
		<div className={styles.createAccount}>
			<h2>Create Account</h2>
			<form onSubmit={handleSubmit}>
				<AvatarField
					onChange={(path) => setAvatarPath(path)}
					value={avatarPath}
				/>
				<TextField
					name='username'
					error={error}
					onChange={(newUsername: string) => setUsername(newUsername)}
					placeholder='Johnny Mnemonic'
					value={username}
				/>
				<Button>Save</Button>
			</form>
		</div>
	)
}