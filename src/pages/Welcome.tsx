import { Link } from 'react-router-dom'
import { Room } from '../models/rooms'
import {usePopularRooms} from '../hooks'
import styles from './Welcome.module.css'

export default function Welcome() {
	const rooms = usePopularRooms()

	return (
		<div className={styles.welcome}>
			<div className={styles.welcomeContainer}>
				<h2>Welcome</h2>
				<p>Check out some our most popular communities...</p>
				{rooms.map(({id, name}: Room) =>
					<Link key={id} to={`/rooms/${name}`}>{name}</Link>,
				)}
			</div>
		</div>
	)
}