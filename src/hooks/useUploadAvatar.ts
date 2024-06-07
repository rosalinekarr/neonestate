import { useContext } from 'react'
import { ImagesContext } from '../providers/ImagesProvider'

export default function useUploadAvatar() {
	const imagesContext = useContext(ImagesContext)
	if (!imagesContext) throw new Error('Missing ImagesContext: useUploadAvatar must only be invoked within ImagesProvider')
	return imagesContext.uploadAvatar
}