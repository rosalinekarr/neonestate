import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react'
import styles from './IconButton.module.css'

interface IconButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	icon: FC;
}

export default function IconButton({className, children, icon: Icon, ...props}: IconButtonProps) {
	delete props.ref
	return (
		<button className={[styles.iconButton, ...className ? [className] : []].join(' ')} {...props}>
			<Icon />
			{children && <span className={styles.iconButtonText}>{children}</span>}
		</button>
	)
}
