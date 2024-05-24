import { useContext, useEffect } from 'react'
import { ImagesContext } from '../providers/ImagesProvider'

export default function useImage(path: string) {
	const imagesContext = useContext(ImagesContext)
	if (!imagesContext) throw new Error('Missing ImagesContext: useImage must only be invoked within ImagesProvider')
	const {fetchImage, images} = imagesContext

	useEffect(() => {
		fetchImage(path)
	}, [path])

	return images[path]
}