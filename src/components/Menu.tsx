import { ChangeEvent, FormEvent, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useFirebaseApp, useRooms } from '../hooks'
import { Room } from '../models/rooms'
import CreateIcon from './icons/create'
import styles from './Menu.module.css'
import { getAuth, signOut } from 'firebase/auth'
import Button from './Button'
import Donate from './Donate'

interface OpenChannelFormProps {
	onSubmit: () => void;
}

function OpenChannelForm({onSubmit}: OpenChannelFormProps) {
	const [name, setName] = useState<string>('')
	const navigate = useNavigate()

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setName(e.target.value.replaceAll(/[^\w-_]/g, '_'))
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		navigate(`/rooms/${name}`)
		setName('')
		onSubmit()
	}

	return (
		<form className={styles.menuNewChannelForm} onSubmit={handleSubmit}>
			<input
				type='text'
				onChange={handleChange}
				placeholder='open new channel'
				value={name}
			/>
			<button type='submit'>
				<CreateIcon />
			</button>
		</form>
	)
}

interface MenuProps {
	onClose: () => void;
	open: boolean;
}

export default function Menu({onClose, open}: MenuProps) {
	const [showDonateModal, setShowDonateModal] = useState<boolean>(false)
	const app = useFirebaseApp()
	const navigate = useNavigate()
	const rooms = useRooms()

	async function handleSignOut() {
		const auth = getAuth(app)
		await signOut(auth)
		navigate('/')
	}

	return (
		<nav className={[styles.menu, ...open ? [styles.open] : []].join(' ')}>
			<div className={styles.menuChannels}>
				{rooms.map((room: Room) =>
					<NavLink key={room.id} className={styles.menuItem} to={`/rooms/${room.name}`}>{room.name}</NavLink>,
				)}
				<OpenChannelForm onSubmit={onClose} />
			</div>
			<div className={styles.menuAccount}>
				<Button className={styles.menuItem} onClick={() => setShowDonateModal(true)}>Donate</Button>
				<Button className={styles.menuItem} onClick={handleSignOut}>Sign out</Button>
			</div>
			{showDonateModal &&
				<Donate onClose={() => setShowDonateModal(false)} />
			}
		</nav>
	)
}