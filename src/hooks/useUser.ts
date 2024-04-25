import { useContext } from 'react'
import { UserContext } from '../providers/UserProvider'

export default function useUser() {
	return useContext(UserContext)
}