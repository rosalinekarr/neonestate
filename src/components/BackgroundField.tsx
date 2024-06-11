import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes, useRef, useState } from 'react'
import { useImage, useUploadRoomBackground } from '../hooks'
import styles from './BackgroundField.module.css'
import { EditIcon } from './icons'

interface BackgroundFieldProps extends Omit<Partial<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>, 'onChange'> {
	error?: string;
	onChange: (newPath: string) => void;
	value: string | undefined;
}

export default function BackgroundField({error: parentError, name, onChange, value, ...props}: BackgroundFieldProps) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const uploadRoomBackground = useUploadRoomBackground()
	const backgroundUrl = useImage(value || '')
	const error = uploadError || parentError

	async function handleChange(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.files?.length !== 1) return
		const file = e.target.files[0] || null

		try {
			const path = await uploadRoomBackground(file)
			onChange(path)
		} catch (e: any) {
			setUploadError(e.message)
		}
	}

	return (
		<div className={styles.fileField}>
			<label htmlFor='background'>Background</label>
			<div
				className={[styles.backgroundPreview, ...backgroundUrl ? [] : [styles.blank], ...error ? [styles.error] : []].join(' ')}
				onClick={() => inputRef.current?.click()}
			>
			    {backgroundUrl &&
                    <img
                	    src={backgroundUrl}
                    />
				}
				<div className={styles.overlay}>
					<EditIcon />
				</div>
			</div>
			<input
				type='file'
				className={styles.fileInput}
				id='background'
				name='background'
				onChange={handleChange}
				ref={inputRef}
				{...props}
			/>
			{error && <p className={styles.errorMessage}>{error}</p>}
		</div>
	)
}