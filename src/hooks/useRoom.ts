import { useContext } from 'react'
import { RoomsContext } from '../providers/RoomsProvider'

export default function useRoom(roomName: string) {
	const roomsContext = useContext(RoomsContext)
	if (!roomsContext) throw new Error('Missing RoomsContext: useRooms must only be invoked within RoomsContext')
	return roomsContext.roomsByName[roomName] || null
}