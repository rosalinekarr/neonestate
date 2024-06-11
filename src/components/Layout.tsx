import { useState } from 'react'
import {Link, Outlet} from 'react-router-dom'
import {Menu} from '../components'
import { AuthProvider, ImagesProvider, PostsProvider, RoomsProvider, UsersProvider } from '../providers'
import { MenuIcon, ThemeIcon } from './icons'
import styles from './Layout.module.css'

const FOOTER_LINKS: {label: string, path: string}[] = [{label: 'About', path: '/about'}, {label: 'Privacy policy', path: '/privacy-policy'}]

export default function Layout() {
	const [showChannels, setShowChannels] = useState<boolean>(false)

	return (
		<div className={styles.wrapper}>
			<AuthProvider>
				<ImagesProvider>
					<UsersProvider>
						<RoomsProvider>
							<PostsProvider>
								<header className={styles.header}>
									<button className={[styles.menuButton, ...showChannels ? [styles.menuButtonActive] : []].join(' ')} onClick={() => setShowChannels((prevVal) => !prevVal)}>
										<MenuIcon />
									</button>
									<h1>neon.estate</h1>
									<button className={styles.menuButton}>
										<ThemeIcon />
									</button>
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
				</ImagesProvider>
			</AuthProvider>
		</div>
	)
}