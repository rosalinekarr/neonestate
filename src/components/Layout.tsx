import { useState } from 'react'
import {Form, Link, Outlet} from 'react-router-dom'
import {Menu} from '../components'
import { AuthProvider, PostsProvider, RoomsProvider, UsersProvider } from '../providers'
import { MenuIcon, ProfileIcon } from './icons'
import styles from './Layout.module.css'

const FOOTER_LINKS: {label: string, path: string}[] = [{label: 'About', path: '/about'}, {label: 'Privacy policy', path: '/privacy-policy'}]

export default function Layout() {
	const [showChannels, setShowChannels] = useState<boolean>(false)

	return (
		<div className={styles.wrapper}>
			<AuthProvider>
				<UsersProvider>
					<RoomsProvider>
						<PostsProvider>
							<header className={styles.header}>
								<button onClick={() => setShowChannels((prevVal) => !prevVal)}>
									<MenuIcon />
								</button>
								<h1>neon.estate</h1>
								<div>
									<Form method="get" action='/profile'>
										<button type='submit'>
											<ProfileIcon />
										</button>
									</Form>
								</div>
							</header>
							<main className={styles.main}>
								<Menu open={showChannels} />
								<Outlet />
							</main>
							<footer className={styles.footer}>
								{FOOTER_LINKS.map(({label, path}) =>
									<Link key={label} to={path}>{label}</Link>,
								)}
							</footer>
						</PostsProvider>
					</RoomsProvider>
				</UsersProvider>
			</AuthProvider>
		</div>
	)
}