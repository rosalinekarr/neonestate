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
	query = query.orderBy('createdAt', 'asc').limit(25)
	const querySnapshot = await query.get()

	logger.info('Rooms queried', {createdBefore, roomId})
	response.json(querySnapshot.docs.map((doc) => {
		const {authorId, body, createdAt} = doc.data()
		return {
			id: doc.id,
			authorId,
			body,
			createdAt: createdAt.seconds,
		}
	}))
})


app.post('/api/posts', async (request, response) => {
	const body = request.body?.body
	const roomId = request.body?.roomId

	const db = getFirestore()
	const docRef = await db.collection('posts').add({
		authorId: response.locals.uid,
		body,
		createdAt: Timestamp.now(),
		roomId,
	})
	const doc = await docRef.get()

	logger.info('New post created', {id: doc.id})
	const data = doc.data()
	response.json({
		id: doc.id,
		authorId: data?.authorId,
		body: data?.body,
		createdAt: data?.createdAt?.seconds,
		roomId: data?.roomId,
	})
})

app.get('/api/rooms', async (request, response) => {
	const name = request.query.name

	if (typeof name !== 'string' || !name.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u)) {
		logger.warn('Invalid query', {query: request.query})
		response.status(422).json({error: 'Invalid query'})
		return
	}

	const db = getFirestore()
	const querySnapshot = await db.collection('rooms').where('name', '==', name).get()

	logger.info('Rooms queried', {name})
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