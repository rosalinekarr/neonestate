import { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import {titleize} from '../utils'
import styles from './InputField.module.css'

interface InputFieldProps extends Omit<Partial<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>, 'onChange'> {
	error?: string;
	name: string;
	onChange: (newVal: string) => void;
	value: string;
}

export default function InputField({error, name, onChange: handleChange, ...props}: InputFieldProps) {
	return (
		<div className={styles.inputField}>
			<label htmlFor={name}>{titleize(name)}</label>
			<input
				type={props['type'] || 'text'}
				className={error && styles.error}
				id={name}
				name={name}
				onChange={(e) => handleChange(e.target.value)}
				{...props}
			/>
			{error && <p className={styles.errorMessage}>{error}</p>}
		</div>
	)
}