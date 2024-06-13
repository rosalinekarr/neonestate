import Button from './Button'
import styles from './Donate.module.css'

function KofiFrame() {
	return (
		<iframe
			id='kofiframe'
			className={styles.kofiFrame}
			src='https://ko-fi.com/rosalinekarr/?hidefeed=true&widget=true&embed=true&preview=true'
			height='712'
			title='rosalinekarr'
		></iframe>
	)
}

interface DonateProps {
	onClose: () => void;
}

export default function Donate({onClose}: DonateProps) {
	return (
		<div className={styles.donateModalBackdrop}>
			<div className={styles.donateModal}>
				<KofiFrame />
			</div>
			<Button className={styles.closeButton} onClick={() => onClose()}>Close</Button>
		</div>
	)
}