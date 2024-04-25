import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import {Layout} from './components'
import {Home} from './pages'
import {FirebaseProvider, UserProvider} from './providers'

const rootElem = document.getElementById('root')

if (rootElem)
	ReactDOM.createRoot(rootElem).render(
		<React.StrictMode>
			<FirebaseProvider>
				<UserProvider>
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
				</UserProvider>
			</FirebaseProvider>
		</React.StrictMode>,
	)
