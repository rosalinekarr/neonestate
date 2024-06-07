import { useContext } from 'react'
import { ImagesContext } from '../providers/ImagesProvider'

export default function useUploadRoomBackground() {
	const imagesContext = useContext(ImagesContext)
	if (!imagesContext) throw new Error('Missing ImagesContext: useUploadRoomBackground must only be invoked within ImagesProvider')
	return imagesContext.uploadRoomBackground
}