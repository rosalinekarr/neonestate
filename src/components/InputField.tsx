import { DetailedHTMLProps, InputHTMLAttributes } from 'react'
import {titleize} from '../utils'
import styles from './InputField.module.css'

interface InputFieldProps extends Omit<Partial<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>, 'onChange'> {
	name: string;
	value: string;
	onChange: (newVal: string) => void;
}

export default function InputField({name, onChange: handleChange, ...props}: InputFieldProps) {
	return (
		<div className={styles.inputField}>
			<label htmlFor={name}>{titleize(name)}</label>
			<input
				type={props['type'] || 'text'}
				id={name}
				name={name}
				onChange={(e) => handleChange(e.target.value)}
				{...props}
			/>
		</div>
	)
}