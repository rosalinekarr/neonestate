import { ButtonHTMLAttributes, DetailedHTMLProps, FC } from 'react'
import styles from './IconButton.module.css'

interface IconButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
	icon: FC;
}

export default function IconButton({icon: Icon, ...props}: IconButtonProps) {
	delete props.ref
	return (
		<button className={styles.iconButton} {...props}>
			<Icon />
		</button>
	)
}
