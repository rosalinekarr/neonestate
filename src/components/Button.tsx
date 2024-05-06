import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import styles from './Button.module.css'


export default function Button({children, ...props}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
	return (
		<button className={styles.button} {...props}>
			{children}
		</button>
	)
}