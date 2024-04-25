import {Outlet} from 'react-router-dom'
import { useFirebaseApp } from '../hooks'
import { getAuth, signOut } from 'firebase/auth'

export default function Layout() {
	const app = useFirebaseApp()

	function handleSignOut() {
		const auth = getAuth(app)
		signOut(auth)
	}

	return (
		<div>
			<header>
				<button>Menu</button>
				<button>Theme</button>
			</header>
			<main>
				<Outlet />
			</main>
			<footer>
				<button onClick={handleSignOut}>Sign out</button>
			</footer>
		</div>
	)
}