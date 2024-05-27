import { useContext, useEffect } from 'react'
import { ImagesContext } from '../providers/ImagesProvider'

export default function useImage(path: string | undefined) {
	const imagesContext = useContext(ImagesContext)
	if (!imagesContext) throw new Error('Missing ImagesContext: useImage must only be invoked within ImagesProvider')
	const {fetchImage, images} = imagesContext

	useEffect(() => {
		if (path) fetchImage(path)
	}, [path])

	return path ? images[path] : null
}