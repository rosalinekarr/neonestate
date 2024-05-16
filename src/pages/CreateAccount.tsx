import {ProfileForm} from './Profile'
import styles from './CreateAccount.module.css'

interface CreateAccountProps {
	onSubmit: () => void;
}

export default function CreateAccount({onSubmit}: CreateAccountProps) {
	return (
		<div className={styles.createAccount}>
			<h2>Create Account</h2>
			<ProfileForm onSubmit={onSubmit} />
		</div>
	)
}