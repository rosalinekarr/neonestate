import { ReactNode, createContext } from 'react'
import { initializeApp } from 'firebase/app'
import {ReCaptchaV3Provider, initializeAppCheck} from 'firebase/app-check'
import { connectAuthEmulator, getAuth } from 'firebase/auth'

interface FirebaseProviderProps {
	children: ReactNode;
}

const app = initializeApp({
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}, 'neon-estate')

if (import.meta.env.DEV) {
	const auth = getAuth(app)
	connectAuthEmulator(auth, '127.0.0.1:9099')
}

initializeAppCheck(app, {
	provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_KEY),
	isTokenAutoRefreshEnabled: true,
})

export const FirebaseContext = createContext<ReturnType<typeof initializeApp>>(app)

export default function FirebaseProvider({children}: FirebaseProviderProps) {
	return (
		<FirebaseContext.Provider value={app}>{children}</FirebaseContext.Provider>
	)
}