import styles from './Loading.module.css'

export default function Loading() {
	return (
		<progress className={styles.loading}>Loading...</progress>
	)
}