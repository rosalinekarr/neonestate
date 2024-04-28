import { ChangeEvent, FocusEvent, FormEvent, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useFirebaseApp } from '../hooks'
import { listChannels, listenForChannels, saveChannel } from '../models/channel'
import CreateIcon from './icons/create'
import { uniqBy } from '../utils'

function OpenChannelForm() {
	const app = useFirebaseApp()
	const [newChannel, setNewChannel] = useState<string>('')

	function handleBlur(_e: FocusEvent<HTMLTextAreaElement>) {
		setNewChannel((prevVal) => prevVal === '#' ? '' : prevVal)
	}

	function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
		setNewChannel(
			`#${e.target.value.replace(' ', '_').replace(/^\#/, '')}`,
		)
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		saveChannel(app, newChannel.replace(/^\#/, ''))
		setNewChannel('')
	}

	return (
		<form onSubmit={handleSubmit}>
			<textarea
				onBlur={handleBlur}
				onChange={handleChange}
				rows={1}
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
	const [channels, setChannels] = useState<string[]>([])

	useEffect(() => {
		async function loadChannels() {
			const newChannels = await listChannels(app)
			setChannels(newChannels)
		}

		loadChannels()
	}, [])

	useEffect(() => {
		const unsubscribe = listenForChannels(app, (channel) => {
			setChannels(
				(prevChannels) =>
					uniqBy([...prevChannels, channel], (x) => x)
						.sort(),
			)
		})
		return () => unsubscribe()
	}, [])

	return (
		<nav className={`channels${open ? ' open' : ''}`}>
			{channels.map((channel: string) =>
				<NavLink key={channel} to={`/channel/${channel}`}>{`#${channel}`}</NavLink>,
			)}
			<OpenChannelForm />
		</nav>
	)
}