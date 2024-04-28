import {ConfirmationResult, RecaptchaVerifier, getAuth, signInWithPhoneNumber} from 'firebase/auth'
import { ChangeEvent, FormEvent, Ref, useRef, useState } from 'react'
import { useFirebaseApp } from '../hooks'
import { formatPhoneNumber, isPhoneNumberValid } from '../models/phone'

interface PhoneNumberFormProps {
	onSubmit: (phoneNumber: string) => Promise<void>;
	submitRef: Ref<HTMLButtonElement>;
}

function PhoneNumberForm({onSubmit, submitRef}: PhoneNumberFormProps) {
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

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setIsValid((prevIsValid) =>
			prevIsValid || isPhoneNumberValid(rawPhoneNumber),
		)
		setRawPhoneNumber(e.target.value)
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor='phone-number'>Mobile Phone Number</label>
			<input
				type='tel'
				id='phone-number'
				name='phone-number'
				value={rawPhoneNumber}
				onChange={handleChange}
				className={isValid ? undefined : 'error'}
				placeholder='(555) 555-5555'
			/>
			{!isValid &&
				<p className='error-text'>Please use a valid mobile phone number</p>
			}
			<button type='submit' ref={submitRef} id='sign-in'>Submit</button>
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

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		setIsValid((prevIsValid) =>
			prevIsValid || confirmationCode.length === 6,
		)
		setConfirmationCode(e.target.value)
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor='confirmation-code'>Confirmation Code</label>
			<input
				type='text'
				id='confirmation-code'
				name='confirmation-code'
				value={confirmationCode}
				onChange={handleChange}
				className={isValid ? undefined : 'error'}
				placeholder='123456'
			/>
			{!isValid &&
				<p className='error-text'>Incorrect confirmation code</p>
			}
			<button type='submit'>Submit</button>
		</form>
	)
}

export default function SignIn() {
	const app = useFirebaseApp()
	const auth = getAuth(app)
	const recaptchaRef = useRef<HTMLButtonElement | null>(null)
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

	if (isLoading) return (
		<progress />
	)

	return (
		<div className='sign-in'>
			<h2>Sign in</h2>
			{confirmation !== null ?
				<ConfirmationCodeForm
					onSubmit={verifyConfirmationCode}
				/>
			 :
				<PhoneNumberForm
					onSubmit={sendConfirmationCode}
					submitRef={recaptchaRef}
				/>
			}
		</div>
	)
}