import { useContext } from 'react'
import { RoomsContext } from '../providers/RoomsProvider'

export default function useOpenRoom() {
	const roomsContext = useContext(RoomsContext)
	if (!roomsContext) throw new Error('Missing RoomsContext: useOpenRoom must only be invoked within RoomsContext')
	return roomsContext.openRoom
}