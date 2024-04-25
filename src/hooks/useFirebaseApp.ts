import { useContext } from 'react'
import { FirebaseContext } from '../providers/FirebaseProvider'

export default function useFirebaseApp() {
	return useContext(FirebaseContext)
}