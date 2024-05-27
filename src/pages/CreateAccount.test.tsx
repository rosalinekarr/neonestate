import {fireEvent, render, waitFor} from '@testing-library/react'
import {screen} from '@testing-library/dom'
import {describe, expect, it, vi} from 'vitest'
import CreateAccount from './CreateAccount'
import { ImagesContext } from '../providers/ImagesProvider'

describe('CreateAccount', () => {
	it('allows creating a new account with a valid username', async () => {
		const {promise, resolve} = Promise.withResolvers()
		const handleSubmit = vi.fn().mockReturnValue(promise)

		render(<CreateAccount onSubmit={handleSubmit}/>, {wrapper: ({children}) => <ImagesContext.Provider value={{uploadAvatar: vi.fn()} as unknown as ImagesContext}>{children}</ImagesContext.Provider>})

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		fireEvent.click(screen.getByRole('button'))

		expect(handleSubmit).toBeCalledWith({
			avatarPath: '',
			username: 'Johnny Mnemonic',
		})
		expect(screen.getByRole('progressbar')).toBeInTheDocument()

		resolve({})

		await waitFor(() => {
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		})
	})

	it('does not allow creating an account with an existing username', async () => {
		const {promise, reject} = Promise.withResolvers()
		const handleSubmit = vi.fn().mockReturnValue(promise)

		render(<CreateAccount onSubmit={handleSubmit}/>, {wrapper: ({children}) => <ImagesContext.Provider value={{uploadAvatar: vi.fn()} as unknown as ImagesContext}>{children}</ImagesContext.Provider>})

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		fireEvent.click(screen.getByRole('button'))

		expect(handleSubmit).toBeCalledWith({
			avatarPath: '',
			username: 'Johnny Mnemonic',
		})
		expect(screen.getByRole('progressbar')).toBeInTheDocument()

		reject(new Error('Invalid username'))

		await waitFor(() => {
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		})

		expect(screen.getByText('Invalid username')).toBeInTheDocument()
	})
})