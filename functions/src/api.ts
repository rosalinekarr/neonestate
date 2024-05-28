import * as express from 'express'
import { Request, Response } from 'express'
import { getAuth } from 'firebase-admin/auth'
import * as logger from 'firebase-functions/logger'
import {
	createPost,
	createRoom,
	createUser,
	getPosts,
	getRooms,
	getRoom,
	getUsers,
	getUser,
} from './handlers'
import NotFoundError from './errors/notFound'
import UnacceptableError from './errors/unacceptable'

const api = express()

api.use(express.json())

api.use(async (request: Request, response: Response, next) => {
	const authToken = (request.headers.authorization || '').match(/Bearer (.+)/)?.[1]
	const {uid} = await getAuth().verifyIdToken(authToken || '')
	response.locals.uid = uid
	next()
})

function handleErrors(handler: (req: Request, res: Response) => Promise<void>) {
	return async (req: Request, res: Response) => {
		try {
			return handler(req, res)
		} catch (e: any) {
			if (e instanceof NotFoundError) {
				res.status(404).send({error: e.message})
			} else if (e instanceof UnacceptableError) {
				res.status(422).send({error: e.message})
			} else {
				logger.error('Uncaught error', {e})
				res.status(500).send({error: e.message})
			}
		}
	}
}

api.get('/api/posts', handleErrors(getPosts))
api.post('/api/posts', handleErrors(createPost))

api.get('/api/rooms', handleErrors(getRooms))
api.get('/api/rooms/:id', handleErrors(getRoom))
api.post('/api/rooms', handleErrors(createRoom))

api.get('/api/users', handleErrors(getUsers))
api.get('/api/users/:id', handleErrors(getUser))
api.post('/api/users', handleErrors(createUser))

export default api