import * as express from 'express'
import * as admin from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { CollectionReference, DocumentData, Query, Timestamp, getFirestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import {onRequest} from 'firebase-functions/v2/https'

admin.initializeApp({
	projectId: 'neon-estate',
})

const app = express()

app.use(express.json())

app.use(async (request, response, next) => {
	const authToken = (request.headers.authorization || '').match(/Bearer (.+)/)?.[1]
	const {uid} = await getAuth().verifyIdToken(authToken || '')
	response.locals.uid = uid
	next()
})

app.get('/api/posts', async (request, response) => {
	const roomId = typeof request.query.roomId === 'string' ? request.query.roomId : null
	const createdBefore = typeof request.query.createdBefore === 'string' ? parseInt(request.query.createdBefore) : null

	const db = getFirestore()
	let query: CollectionReference<DocumentData> | Query<DocumentData> = db.collection('posts')
	if (createdBefore) query = query.where('createdAt', '<', new Timestamp(createdBefore, 0))
	if (roomId) query = query.where('roomId', '==', roomId)
	query = query.orderBy('createdAt', 'desc').limit(25)
	const querySnapshot = await query.get()

	logger.info('Rooms queried', {createdBefore, roomId})
	response.json(querySnapshot.docs.map((doc) => {
		const {authorId, sections, createdAt} = doc.data()
		return {
			id: doc.id,
			authorId,
			sections,
			createdAt: createdAt.seconds,
		}
	}))
})

interface PostTextSection {
	id: string
	type: string
	body: string
}

type PostSection = PostTextSection

app.post('/api/posts', async (request, response) => {
	const sections = request.body?.sections
	const roomId = request.body?.roomId

	const db = getFirestore()
	const docRef = await db.collection('posts').add({
		authorId: response.locals.uid,
		sections: sections.map((section: PostSection) => {
			if (section?.type === 'text') {
				return {
					id: crypto.randomUUID(),
					type: 'text',
					body: section.body,
				}
			}
			throw new Error('Invalid post section')
		}),
		createdAt: Timestamp.now(),
		roomId,
	})
	const doc = await docRef.get()

	logger.info('New post created', {id: doc.id})
	const data = doc.data()
	response.json({
		id: doc.id,
		authorId: response.locals.uid,
		sections: data?.sections,
		createdAt: data?.createdAt?.seconds,
		roomId: data?.roomId,
	})
})

app.get('/api/rooms', async (request, response) => {
	const name = request.query.name
	const sort = request.query.sort

	if (name && (typeof name !== 'string' || !name.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u))) {
		logger.warn('Invalid query', {query: request.query})
		response.status(422).json({error: 'Invalid query'})
		return
	}

	if (sort && sort !== 'member_count_desc') {
		logger.warn('Invalid query', {query: request.query})
		response.status(422).json({error: 'Invalid query'})
		return
	}

	const db = getFirestore()
	let query: Query<DocumentData> = db.collection('rooms')
	if (name) query = query.where('name', '==', name)
	if (sort === 'member_count_desc') query = query.orderBy('memberCount', 'desc')
	const querySnapshot = await query.get()

	logger.info('Rooms queried', {name, sort})
	response.json(querySnapshot.docs.map((doc) => {
		const {createdAt, name} = doc.data()
		return {
			id: doc.id,
			name,
			createdAt: createdAt.seconds,
		}
	}))
})

app.get('/api/rooms/:id', async (request, response) => {
	const id = request.params.id
	const db = getFirestore()
	const docSnapshot = await db.doc(`rooms/${id}`).get()

	if (!docSnapshot.exists) {
		logger.info('Room not found', {id})
		response.status(404).json({error: 'Not Found'})
		return
	}

	logger.info('Room fetched', {id})
	const data = docSnapshot.data()
	response.status(200).json({
		id: docSnapshot.id,
		name: data?.name,
		createdAt: data?.createdAt?.seconds,
	})
})

app.post('/api/rooms', async (request, response) => {
	const roomName = request.body?.name

	if (typeof roomName !== 'string' || !roomName.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u)) {
		logger.warn('Invalid room name', {name: roomName})
		response.status(422).json({error: 'Invalid room name'})
		return
	}

	const db = getFirestore()
	const querySnapshot = await db.collection('rooms').where('name', '==', roomName).get()

	if (!querySnapshot.empty) {
		logger.warn('Room already exists', {roomName})
		response.status(422).json({error: 'Room already exists'})
		return
	}

	const docRef = await db.collection('rooms').add({
		createdAt: Timestamp.now(),
		memberCount: 1,
		name: roomName,
	})
	const doc = await docRef.get()

	logger.info('New room created', {roomName})
	const data = doc.data()
	response.json({
		id: doc.id,
		name: data?.name,
		createdAt: data?.createdAt?.seconds,
	})
})

app.get('/api/users/:id', async (request, response) => {
	const id = request.params.id
	const db = getFirestore()
	const docSnapshot = await db.doc(`users/${id}`).get()

	if (!docSnapshot.exists) {
		logger.info('User not found', {id})
		response.status(404).json({error: 'Not Found'})
		return
	}

	logger.info('User fetched', {id})
	const data = docSnapshot.data()
	response.status(200).json({
		id: docSnapshot.id,
		username: data?.username,
		createdAt: data?.createdAt?.seconds,
	})
})

app.get('/api/users', async (request, response) => {
	const username = request.query.username

	if (typeof username !== 'string' || !username.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u)) {
		logger.warn('Invalid query', {query: request.query})
		response.status(422).json({error: 'Invalid query'})
		return
	}

	const db = getFirestore()
	const querySnapshot = await db.collection('users').where('username', '==', username).get()

	logger.info('Users queried', {name})
	response.json(querySnapshot.docs.map((doc) => {
		const {createdAt, username} = doc.data()
		return {
			id: doc.id,
			username,
			createdAt: createdAt.seconds,
		}
	}))
})

app.get('/api/profile', async (request, response) => {
	const db = getFirestore()
	const uid = response.locals.uid

	response.set({
		'Cache-Control': 'no-cache',
	})

	const docSnapshot = await db.doc(`users/${uid}`).get()

	if (!docSnapshot.exists) {
		logger.info('User profile does not exist yet', {uid})
		response.status(404).json({error: 'User not found'})
		return
	}

	logger.info('User fetched', {uid})
	const data = docSnapshot.data()
	response.status(200).json({
		id: docSnapshot.id,
		username: data?.username,
		createdAt: data?.createdAt?.seconds,
	})
})

app.post('/api/users', async (request, response) => {
	const uid = response.locals.uid
	const username = request.body?.username

	if (typeof username !== 'string' || !username.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u)) {
		logger.warn('Invalid username', {username})
		response.status(422).json({error: 'Invalid username'})
		return
	}

	const db = getFirestore()
	const querySnapshot = await db.collection('users').where('username', '==', username).get()

	if (!querySnapshot.empty) {
		logger.warn('Username already exists', {username})
		response.status(422).json({error: 'Username already exists'})
		return
	}

	await db.doc(`users/${uid}`).set({
		createdAt: Timestamp.now(),
		username,
	})
	const doc = await db.doc(`users/${uid}`).get()

	logger.info('New user registered', {username})
	const data = doc.data()
	response.json({
		id: doc.id,
		username: data?.username,
		createdAt: data?.createdAt?.seconds,
	})
})

exports.app = onRequest(app)