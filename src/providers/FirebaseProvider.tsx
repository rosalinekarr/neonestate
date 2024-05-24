import { ReactNode, createContext, useEffect, useState } from 'react'
import { FirebaseApp, initializeApp } from 'firebase/app'
import {ReCaptchaV3Provider, initializeAppCheck} from 'firebase/app-check'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions'
import { Loading } from '../components'

declare global {
	var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined
}

interface FirebaseProviderProps {
	children: ReactNode;
}

export const FirebaseContext = createContext<ReturnType<typeof initializeApp> | undefined>(undefined)

export default function FirebaseProvider({children}: FirebaseProviderProps) {
	const [app, setApp] = useState<FirebaseApp | undefined>()

	useEffect(() => {
		if (app) return

		const newApp = initializeApp({
			apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
		}, 'neon-estate')

		if (import.meta.env.MODE === 'development') {
			const auth = getAuth(newApp)
			const db = getFirestore(newApp)
			const functions = getFunctions(newApp)
			const storage = getStorage(newApp)
			connectAuthEmulator(auth, 'http://127.0.0.1:9099')
			connectFirestoreEmulator(db, 'http://127.0.0.1', 8080)
			connectStorageEmulator(storage, '127.0.0.1', 9199)
			connectFunctionsEmulator(functions, 'http://127.0.0.1', 5001)
			window.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_DEBUG_APP_CHECK_TOKEN
		}
		initializeAppCheck(newApp, {
			provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_KEY),
			isTokenAutoRefreshEnabled: true,
		})

		setApp(newApp)
	})

	if (!app) return <Loading />

	return (
		<FirebaseContext.Provider value={app}>{children}</FirebaseContext.Provider>
	)
}