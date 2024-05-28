import { Request, Response } from 'express'
import { DocumentData, Query, Timestamp, getFirestore } from 'firebase-admin/firestore'
import * as logger from 'firebase-functions/logger'
import UnacceptableError from '../errors/unacceptable'
import NotFoundError from '../errors/notFound'

export async function getRooms(request: Request, response: Response) {
	const name = request.query.name
	const sort = request.query.sort

	if (name && (typeof name !== 'string' || !name.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u))) {
		throw new UnacceptableError('Invalid room name')
	}

	if (sort && sort !== 'member_count_desc') {
		throw new UnacceptableError('Invalid sort option')
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
}

export async function getRoom(request: Request, response: Response) {
	const id = request.params.id
	const db = getFirestore()
	const docSnapshot = await db.doc(`rooms/${id}`).get()

	if (!docSnapshot.exists) {
		throw new NotFoundError('Room not found')
	}

	logger.info('Room fetched', {id})
	const data = docSnapshot.data()
	response.status(200).json({
		id: docSnapshot.id,
		name: data?.name,
		createdAt: data?.createdAt?.seconds,
	})
}

export async function createRoom(request: Request, response: Response) {
	const roomName = request.body?.name

	if (typeof roomName !== 'string' || !roomName.match(/^[\p{L}\p{N}\p{P}\p{S}]+$/u)) {
		throw new UnacceptableError('Invalid room name')
	}

	const db = getFirestore()
	const querySnapshot = await db.collection('rooms').where('name', '==', roomName).get()

	if (!querySnapshot.empty) {
		throw new UnacceptableError('Room name already taken')
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
}