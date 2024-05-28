import { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes, useRef, useState } from 'react'
import { useImage, useUploadAvatar } from '../hooks'
import styles from './AvatarField.module.css'
import { EditIcon } from './icons'

interface AvatarFieldProps extends Omit<Partial<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>, 'onChange'> {
	error?: string;
	onChange: (newPath: string) => void;
	value: string | undefined;
}

export default function AvatarField({error: parentError, name, onChange, value, ...props}: AvatarFieldProps) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const uploadAvatar = useUploadAvatar()
	const avatarUrl = useImage(value || '')
	const error = uploadError || parentError

	async function handleChange(e: ChangeEvent<HTMLInputElement>) {
		if (e.target.files?.length !== 1) return
		const file = e.target.files[0] || null

		try {
			const path = await uploadAvatar(file)
			onChange(path)
		} catch (e: any) {
			setUploadError(e.message)
		}
	}

	return (
		<div className={styles.fileField}>
			<label htmlFor='avatar'>Avatar</label>
			<div
				className={[styles.avatarPreview, ...avatarUrl ? [] : [styles.blank], ...error ? [styles.error] : []].join(' ')}
				onClick={() => inputRef.current?.click()}
			>
			    {avatarUrl &&
                    <img
                	    src={avatarUrl}
                    />
				}
				<div className={styles.overlay}>
					<EditIcon />
				</div>
			</div>
			<input
				type='file'
				className={styles.fileInput}
				id='avatar'
				name='avatar'
				onChange={handleChange}
				ref={inputRef}
				{...props}
			/>
			{error && <p className={styles.errorMessage}>{error}</p>}
		</div>
	)
}