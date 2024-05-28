import {Adsense} from '@ctrl/react-adsense'

export default function Ad() {
	const adSenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID
	const adSenseSlotId = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ?
		import.meta.env.VITE_ADSENSE_DARK_MODE_SLOT_ID
	 :
		import.meta.env.VITE_ADSENSE_LIGHT_MODE_SLOT_ID

	if (!adSenseClientId || !adSenseSlotId) return false

	return (
		<Adsense
			client={adSenseClientId}
			slot={adSenseSlotId}
		/>
	)
}