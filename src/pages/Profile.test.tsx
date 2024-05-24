import {fireEvent, render, waitFor} from '@testing-library/react'
import {screen} from '@testing-library/dom'
import {describe, expect, it, vi} from 'vitest'
import {ProfileForm} from './Profile'
import { UsersContext } from '../providers/UsersProvider'

describe('ProfileForm', () => {
	it('allows updating username with a valid new one', async () => {
		const {promise: updateProfilePromise, resolve} = Promise.withResolvers()
		const updateProfile = vi.fn(() => updateProfilePromise)
		const handleClose = vi.fn()

		render(<ProfileForm onClose={handleClose}/>, {
			wrapper: ({children}) =>
				<UsersContext.Provider value={{
					updateProfile,
				} as unknown as UsersContext}>{children}</UsersContext.Provider>,

		})

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		fireEvent.click(screen.getByRole('button', {name: 'Submit'}))

		expect(updateProfile).toBeCalledWith({
			username: 'Johnny Mnemonic',
		})
		expect(screen.getByRole('progressbar')).toBeInTheDocument()

		resolve({})

		await waitFor(() => {
			expect(handleClose).toBeCalled()
		})
	})

	it('does not allows updating username with an existing one', async () => {
		const {promise: updateProfilePromise, reject} = Promise.withResolvers()
		const updateProfile = vi.fn(() => updateProfilePromise)
		const handleClose = vi.fn()

		render(<ProfileForm onClose={handleClose}/>, {
			wrapper: ({children}) =>
				<UsersContext.Provider value={{
					updateProfile,
				} as unknown as UsersContext}>{children}</UsersContext.Provider>,

		})

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		fireEvent.click(screen.getByRole('button', {name: 'Submit'}))

		expect(updateProfile).toBeCalledWith({
			username: 'Johnny Mnemonic',
		})
		expect(screen.getByRole('progressbar')).toBeInTheDocument()

		reject(new Error('Invalid username'))

		await waitFor(() => {
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		})

		expect(screen.getByText('Error: Invalid username')).toBeInTheDocument()
	})

	it('calls onClose when cancelled', async () => {
		const handleClose = vi.fn()

		render(<ProfileForm onClose={handleClose}/>, {
			wrapper: ({children}) =>
				<UsersContext.Provider value={{updateProfile: vi.fn()} as unknown as UsersContext}>{children}</UsersContext.Provider>,

		})

		fireEvent.click(screen.getByRole('button', {name: 'Close'}))

		await waitFor(() => {
			expect(handleClose).toBeCalled()
		})
	})
})