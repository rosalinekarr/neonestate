import {ReactNode, createContext, useState} from 'react'
import { Room, createRoom, searchRooms } from '../models/rooms'
import { useAuth } from '../hooks'

interface RoomsProviderProps {
	children: ReactNode;
}

interface RoomsContext {
	openRoom: (name: string) => Promise<Room | null>
	rooms: Room[]
}

export const RoomsContext = createContext<RoomsContext | null>(null)

export default function RoomsProvider({children}: RoomsProviderProps) {
	const auth = useAuth()
	const [rooms, setRooms] = useState<Record<string, Room>>({})
	const [idsByName, setIdsByName] = useState<Record<string, string>>({})

	async function openRoom(name: string): Promise<Room | null> {
		if (idsByName[name] && rooms[idsByName[name]]) return rooms[idsByName[name]]

		let room = (await searchRooms(auth, name)).find((r) => r.name === name) || null

		if (!room) {
			room = await createRoom(auth, {
				name,
				description: '',
			})
		}

		setRooms((prevRooms) => ({
			...prevRooms,
			[room.id]: room,
		}))
		setIdsByName((prevIdsByName) => ({
			...prevIdsByName,
			[room.name]: room.id,
		}))

		return room
	}

	return (
		<RoomsContext.Provider value={{
			openRoom,
			rooms: Object.values(rooms),
		}}>{children}</RoomsContext.Provider>
	)
}