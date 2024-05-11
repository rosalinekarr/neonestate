import { ChangeEvent, FormEvent, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useOpenRoom, useRooms } from '../hooks'
import { Room } from '../models/rooms'
import CreateIcon from './icons/create'
import styles from './Menu.module.css'

function OpenChannelForm() {
	const openRoom = useOpenRoom()
	const [name, setName] = useState<string>('')

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setName(e.target.value.replaceAll(/[^\w-_]]/g, '_'))
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		openRoom(name)
		setName('')
	}

	return (
		<form onSubmit={handleSubmit}>
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
	open: boolean;
}

export default function Menu({open}: MenuProps) {
	const rooms = useRooms()

	return (
		<nav className={[styles.menu, ...open ? [styles.open] : []].join(' ')}>
			{rooms.map((room: Room) =>
				<NavLink key={room.id} to={`/rooms/${room.name}`}>{room.name}</NavLink>,
			)}
			<OpenChannelForm />
		</nav>
	)
}