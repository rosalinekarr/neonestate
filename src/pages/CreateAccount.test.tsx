import {fireEvent, render, waitFor} from '@testing-library/react'
import {screen} from '@testing-library/dom'
import {describe, expect, it, vi} from 'vitest'
import CreateAccount from './CreateAccount'
import { ImagesContext } from '../providers/ImagesProvider'

describe('CreateAccount', () => {
	const testFile = new File(
		['🖼️'],
		'avatar.txt',
		{type: 'text/plain'},
	)

	it('allows creating a new account with a valid username and an avatar', async () => {
		const {promise, resolve} = Promise.withResolvers()
		const handleSubmit = vi.fn().mockReturnValue(promise)
		const uploadAvatar = vi.fn().mockResolvedValue('avatar_path')
		let images: Record<string, string> = {}

		render(<CreateAccount onSubmit={handleSubmit}/>, {wrapper: ({children}) => <ImagesContext.Provider value={{fetchImage: vi.fn(), images, uploadAvatar} as unknown as ImagesContext}>{children}</ImagesContext.Provider>})

		fireEvent.change(
			screen.getByLabelText('Avatar'),
			{target: {files: [testFile]}},
		)

		expect(uploadAvatar).toHaveBeenCalledWith(testFile)
		images = {avatar_path: 'avatar_url'}

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		await new Promise((res) => setTimeout(res, 1))

		fireEvent.click(screen.getByRole('button'))

		expect(screen.getByRole('progressbar')).toBeInTheDocument()

		resolve({})

		await waitFor(() => {
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		})
	})

	it('does not allow creating an account without an avatar', async () => {
		const handleSubmit = vi.fn()

		render(<CreateAccount onSubmit={handleSubmit}/>, {wrapper: ({children}) => <ImagesContext.Provider value={{fetchImage: vi.fn(), images: {}, uploadAvatar: vi.fn()} as unknown as ImagesContext}>{children}</ImagesContext.Provider>})

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		await new Promise((res) => setTimeout(res, 1))

		fireEvent.click(screen.getByRole('button'))

		expect(handleSubmit).not.toBeCalled()
		expect(screen.getByText('Avatar is required')).toBeInTheDocument()
	})

	it('does not allow creating an account without a username', async () => {
		const handleSubmit = vi.fn()
		const uploadAvatar = vi.fn().mockResolvedValue('avatar_path')

		render(<CreateAccount onSubmit={handleSubmit}/>, {wrapper: ({children}) => <ImagesContext.Provider value={{fetchImage: vi.fn(), images: {}, uploadAvatar} as unknown as ImagesContext}>{children}</ImagesContext.Provider>})

		fireEvent.change(
			screen.getByLabelText('Avatar'),
			{target: {files: [testFile]}},
		)

		expect(uploadAvatar).toHaveBeenCalledWith(testFile)

		await new Promise((res) => setTimeout(res, 1))

		fireEvent.click(screen.getByRole('button'))

		expect(handleSubmit).not.toBeCalled()
		expect(screen.getByText('Username is required')).toBeInTheDocument()
	})

	it('does not allow creating an account with an existing username', async () => {
		const {promise, reject} = Promise.withResolvers()
		const handleSubmit = vi.fn().mockReturnValue(promise)
		const uploadAvatar = vi.fn().mockResolvedValue('avatar_path')

		render(<CreateAccount onSubmit={handleSubmit}/>, {wrapper: ({children}) => <ImagesContext.Provider value={{fetchImage: vi.fn(), images: {}, uploadAvatar} as unknown as ImagesContext}>{children}</ImagesContext.Provider>})

		fireEvent.change(
			screen.getByLabelText('Avatar'),
			{target: {files: [testFile]}},
		)

		expect(uploadAvatar).toHaveBeenCalledWith(testFile)

		fireEvent.change(
			screen.getByLabelText('Username'),
			{target: {value: 'Johnny Mnemonic'}},
		)

		await new Promise((res) => setTimeout(res, 1))

		fireEvent.click(screen.getByRole('button'))

		expect(handleSubmit).toBeCalledWith({
			avatarPath: 'avatar_path',
			username: 'Johnny Mnemonic',
		})
		expect(screen.getByRole('progressbar')).toBeInTheDocument()

		reject(new Error('Username is already taken'))

		await waitFor(() => {
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		})

		expect(screen.getByText('Username is already taken')).toBeInTheDocument()
	})
})