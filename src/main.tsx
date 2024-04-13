import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {Layout} from './components'
import {Home} from './pages'

getAnalytics(
	initializeApp({
		apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
		appId: import.meta.env.VITE_FIREBASE_APP_ID,
		authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
		measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
		projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	}),
)

const rootElem = document.getElementById('root')

if (rootElem)
	ReactDOM.createRoot(rootElem).render(
		<React.StrictMode>
			<RouterProvider router={createBrowserRouter([
				{
					path: '/',
					element: <Layout />,
					children: [
						{
							element: <Home />,
							index: true,
						},
					],
				},
			])} />
		</React.StrictMode>,
	)
