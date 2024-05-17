import { FormEvent, useState } from 'react'
import { IconButton, InputField, Loading } from '../components'
import { CheckIcon } from '../components/icons'
import { User } from '../models/users'
import styles from './CreateAccount.module.css'

interface CreateAccountProps {
	onSubmit: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
}

export default function CreateAccount({onSubmit}: CreateAccountProps) {
	const [username, setUsername] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | undefined>(undefined)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		setError(undefined)
		try {
			await onSubmit({username})
		} catch (e: any) {
			setError(e.toString())
		}
		setIsLoading(false)
	}

	if (isLoading) return <Loading />

	return (
		<div className={styles.createAccount}>
			<h2>Create Account</h2>
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
					error={error}
					onChange={(newUsername) => setUsername(newUsername)}
					placeholder='Johnny Mnemonic'
					value={username}
				/>
				<IconButton icon={CheckIcon} type='submit' />
			</form>
		</div>
	)
}