import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import styles from './Button.module.css'


export default function Button({className, children, ...props}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>) {
	return (
		<button className={[
			...(className ? [className] : []),
			styles.button,
		].join(' ')} {...props}>
			{children}
		</button>
	)
}