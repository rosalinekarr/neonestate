import { ReactNode, createContext, useState } from 'react'
import { useFirebaseApp } from '../hooks'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

const ACCEPTABLE_AVATAR_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ImagesProviderProps {
	children: ReactNode;
}

export interface ImagesContext {
	fetchImage: (path: string) => Promise<void>
	images: Record<string, string>
	uploadAvatar: (file: File) => Promise<string>
}

export const ImagesContext = createContext<ImagesContext | null>(null)

export default function ImagesProvider({children}: ImagesProviderProps) {
	const app = useFirebaseApp()
	const [images, setImages] = useState<Record<string, string>>({})

	async function fetchImage(path: string) {
		if (images[path]) return
		const storage = getStorage(app)
		try {
			const fetchedUrl = await getDownloadURL(
				ref(storage, path),
			)
			setImages((prevImages) => ({
				...prevImages,
				[path]: fetchedUrl,
			}))
		} catch (e: any) {
			if (e['code'] !== 'storage/object-not-found') throw e
		}
	}

	async function uploadAvatar(file: File) {
		if (!ACCEPTABLE_AVATAR_FILE_TYPES.includes(file.type)) throw new Error('Unsupported file type')
		const storage = getStorage(app)
		const path = `avatar_${crypto.randomUUID()}`
		await uploadBytes(
			ref(storage, path),
			file,
			{contentType: file.type},
		)
		return path
	}

	return <ImagesContext.Provider value={{
		fetchImage,
		images,
		uploadAvatar,
	}}>{children}</ImagesContext.Provider>
}