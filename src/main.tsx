import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {Layout} from './components'
import {Channel, Profile} from './pages'
import {AuthProvider, FirebaseProvider} from './providers'
import './index.css'

const rootElem = document.getElementById('root')

if (rootElem)
	ReactDOM.createRoot(rootElem).render(
		<React.StrictMode>
			<FirebaseProvider>
				<AuthProvider>
					<RouterProvider router={createBrowserRouter([
						{
							path: '/',
							element: <Layout />,
							children: [
								{
									element: <Channel />,
									index: true,
								},
								{
									element: <Channel />,
									path: '/channel/:channelId',
								},
								{
									element: <Profile />,
									path: '/profile',
								},
								{
									element: <Profile />,
									path: '/users/:userId',
								},
							],
						},
					])} />
				</AuthProvider>
			</FirebaseProvider>
		</React.StrictMode>,
	)
