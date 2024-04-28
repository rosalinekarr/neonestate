import React from 'react'
import ReactDOM from 'react-dom/client'
import {Navigate, RouterProvider, createBrowserRouter} from 'react-router-dom'
import {Layout} from './components'
import {About, Channel, PrivacyPolicy, Profile} from './pages'
import {AuthProvider, FirebaseProvider, UsersProvider} from './providers'
import './index.css'

const rootElem = document.getElementById('root')

if (rootElem)
	ReactDOM.createRoot(rootElem).render(
		<React.StrictMode>
			<FirebaseProvider>
				<AuthProvider>
					<UsersProvider>
						<RouterProvider router={createBrowserRouter([
							{
								path: '/',
								element: <Layout />,
								children: [
									{
										element: <Navigate to="/channel/welcome" replace={true} />,
										index: true,
									},
									{
										element: <About />,
										path: '/about',
									},
									{
										element: <Channel />,
										path: '/channel/:id',
									},
									{
										element: <PrivacyPolicy />,
										path: '/privacy-policy',
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
					</UsersProvider>
				</AuthProvider>
			</FirebaseProvider>
		</React.StrictMode>,
	)
