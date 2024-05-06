import { ChangeEvent, FocusEvent, FormEvent, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useFirebaseApp } from '../hooks'
import { Channel, listChannels, listenForChannels, createChannel } from '../models/channel'
import CreateIcon from './icons/create'
import { uniqBy } from '../utils'
import styles from './Menu.module.css'

function OpenChannelForm() {
	const app = useFirebaseApp()
	const [newChannel, setNewChannel] = useState<string>('')

	function handleBlur(_e: FocusEvent<HTMLInputElement>) {
		setNewChannel((prevVal) => prevVal === '#' ? '' : prevVal)
	}

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setNewChannel(
			`#${e.target.value.replace(' ', '_').replace(/^\#/, '')}`,
		)
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		createChannel(app, {
			name: newChannel.replace(/^\#/, ''),
			description: '',
		})
		setNewChannel('')
	}

	return (
		<form onSubmit={handleSubmit}>
			<input
				type='text'
				onBlur={handleBlur}
				onChange={handleChange}
				placeholder='#open new channel'
				value={newChannel}
			/>
			<button type='submit'>
				<CreateIcon />
			</button>
		</form>
	)
}

interface ChannelsMenuProps {
	open: boolean;
}

export default function ChannelsMenu({open}: ChannelsMenuProps) {
	const app = useFirebaseApp()
	const [channels, setChannels] = useState<Channel[]>([])

	useEffect(() => {
		async function loadChannels() {
			const newChannels = await listChannels(app)
			setChannels(newChannels)
		}

		loadChannels()
	}, [])

	useEffect(() => {
		const unsubscribe = listenForChannels(app, (channel: Channel) => {
			setChannels(
				(prevChannels: Channel[]): Channel[] =>
					uniqBy<Channel, string>(
						[...prevChannels, channel],
						(x) => x.id,
					)
						.sort((channelA: Channel, channelB: Channel) => channelA.name.localeCompare(channelB.name)),
			)
		})
		return () => unsubscribe()
	}, [])

	return (
		<nav className={[styles.menu, ...open ? [styles.open] : []].join(' ')}>
			{channels.map((channel: Channel) =>
				<NavLink key={channel.id} to={`/channel/${channel.name}`}>{`#${channel.name}`}</NavLink>,
			)}
			<OpenChannelForm />
		</nav>
	)
}