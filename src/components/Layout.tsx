import {Form, Link, Outlet} from 'react-router-dom'
import {ChannelsMenu} from '../components'
import { MenuIcon, ProfileIcon, ThemeIcon } from './icons'
import { useState } from 'react'

const FOOTER_LINKS: {label: string, path: string}[] = [{label: 'About', path: '/about'}, {label: 'License', path: '/license'}, {label: 'Privacy policy', path: '/privacy-policy'}]

export default function Layout() {
	const [showChannels, setShowChannels] = useState<boolean>(false)

	return (
		<div className='wrapper'>
			<header>
				<button onClick={() => setShowChannels((prevVal) => !prevVal)}>
					<MenuIcon />
				</button>
				<h1>neon.estate</h1>
				<div>
					<button>
						<ThemeIcon />
					</button>
					<Form method="get" action='/profile'>
						<button type='submit'>
							<ProfileIcon />
						</button>
					</Form>
				</div>
			</header>
			<main>
				<ChannelsMenu open={showChannels} />
				<Outlet />
			</main>
			<footer>
				{FOOTER_LINKS.map(({label, path}) =>
					<Link key={label} to={path}>{label}</Link>,
				)}
			</footer>
		</div>
	)
}