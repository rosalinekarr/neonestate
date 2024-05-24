import styles from './Loading.module.css'

type LoadingSize = 'large' | 'medium' | 'small'

const sizeStyles: Record<LoadingSize, string> = {
	large: styles.loadingLarge,
	medium: styles.loadingMedium,
	small: styles.loadingSmall,
}

interface LoadingProps {
	size?: LoadingSize
}

export default function Loading({size}: LoadingProps) {
	const sizeStyle = sizeStyles[size || 'medium']
	return (
		<progress className={[styles.loading, sizeStyle].join(' ')}>Loading...</progress>
	)
}