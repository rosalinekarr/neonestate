import {ConfirmationResult, RecaptchaVerifier, getAuth, signInWithPhoneNumber} from 'firebase/auth'
import { FormEvent, useState } from 'react'
import {CheckIcon} from '../components/icons'
import { useFirebaseApp } from '../hooks'
import { formatPhoneNumber, isPhoneNumberValid } from '../models/phone'
import styles from './SignIn.module.css'
import { IconButton, InputField, Loading } from '../components'

interface PhoneNumberFormProps {
	onSubmit: (phoneNumber: string) => Promise<void>;
}

function PhoneNumberForm({onSubmit}: PhoneNumberFormProps) {
	const [rawPhoneNumber, setRawPhoneNumber] = useState<string>('')
	const [isValid, setIsValid] = useState<boolean>(true)

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const phoneNumber = formatPhoneNumber(rawPhoneNumber)
		if (phoneNumber) {
			onSubmit(phoneNumber).catch(() => {
				setIsValid(false)
			})
		} else {
			setIsValid(false)
		}
	}

	function handleChange(newPhoneNumber: string) {
		setIsValid((prevIsValid) =>
			prevIsValid || isPhoneNumberValid(newPhoneNumber),
		)
		setRawPhoneNumber(newPhoneNumber)
	}

	return (
		<form onSubmit={handleSubmit}>
			<InputField
				type='tel'
				className={isValid ? undefined : 'error'}
				name='phone-number'
				placeholder='(555) 555-5555'
				onChange={handleChange}
				value={rawPhoneNumber}
			/>
			{!isValid &&
				<p className='error-text'>Please use a valid mobile phone number</p>
			}
			<IconButton type='submit' icon={CheckIcon} id='sign-in' />
		</form>
	)
}

interface ConfirmationCodeFormProps {
	onSubmit: (code: string) => Promise<void>;
}

function ConfirmationCodeForm({onSubmit}: ConfirmationCodeFormProps) {
	const [confirmationCode, setConfirmationCode] = useState<string>('')
	const [isValid, setIsValid] = useState<boolean>(true)

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		if (confirmationCode.length !== 6) {
			setIsValid(false)
			return
		}
		onSubmit(confirmationCode).catch(() => {
			setIsValid(false)
		})
	}

	function handleChange(newCode: string) {
		setIsValid((prevIsValid) =>
			prevIsValid || newCode.length === 6,
		)
		setConfirmationCode(newCode)
	}

	return (
		<form onSubmit={handleSubmit}>
			<InputField
				className={isValid ? undefined : 'error'}
				name='confirmation-code'
				placeholder='123456'
				onChange={handleChange}
				value={confirmationCode}
			/>
			{!isValid &&
				<p className='error-text'>Incorrect confirmation code</p>
			}
			<IconButton type='submit' icon={CheckIcon} />
		</form>
	)
}

export default function SignIn() {
	const app = useFirebaseApp()
	const auth = getAuth(app)
	const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function sendConfirmationCode(phoneNumber: string): Promise<void> {
		setConfirmation(
			await signInWithPhoneNumber(
				auth,
				phoneNumber,
				new RecaptchaVerifier(
					auth,
					'sign-in',
					{
						callback: () => setIsLoading(true),
						size: 'invisible',
					},
				),
			),
		)
		setIsLoading(false)
	}

	async function verifyConfirmationCode(code: string): Promise<void> {
		if (!confirmation) return
		setIsLoading(true)
		await confirmation.confirm(code)
		setIsLoading(false)
	}

	if (isLoading) return <Loading/>

	return (
		<div className={styles.signIn}>
			<h2>Sign in</h2>
			{confirmation !== null ?
				<ConfirmationCodeForm
					onSubmit={verifyConfirmationCode}
				/>
			 :
				<PhoneNumberForm
					onSubmit={sendConfirmationCode}
				/>
			}
		</div>
	)
}