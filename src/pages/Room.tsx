import {ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState} from 'react'
import {Loading, Post} from '../components'
import {Room as RoomModel} from '../models/rooms'
import {createPost} from '../models/posts'
import { useAuth, useCurrentUser, useOpenRoom, usePostsForRoom } from '../hooks'
import { useParams } from 'react-router-dom'
import { formatAgo } from '../utils'
import { CreateIcon } from '../components/icons'
import styles from './Room.module.css'

const SCROLL_TOP_THRESHOLD = 10

interface NewPostFormProps {
	room: RoomModel;
}

function NewPostForm({room}: NewPostFormProps) {
	const auth = useAuth()
	const currentUser = useCurrentUser()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const [body, setBody] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await createPost(auth, {
			authorId: currentUser.id,
			body,
			roomId: room.id,
		})
		if (!textAreaRef.current) return
		textAreaRef.current.style.height = '0'
		textAreaRef.current.style.height = `${textAreaRef.current?.scrollHeight}px`
		setBody('')
		setIsLoading(false)
	}

	function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
		if (!textAreaRef.current) return
		textAreaRef.current.style.height = '0'
		textAreaRef.current.style.height = `${textAreaRef.current?.scrollHeight}px`
		setBody(e.target.value)
	}4

	return (
		<form onSubmit={handleSubmit} className={styles.newPostForm}>
			<textarea
				disabled={isLoading}
				ref={textAreaRef}
				rows={1}
				onChange={handleChange}
				placeholder='Say something...'
				value={body}
			/>
			<button type='submit' disabled={isLoading}>
				<CreateIcon />
			</button>
		</form>
	)
}

interface PostsProps {
	room: RoomModel;
}

function Posts({room}: PostsProps) {
	const roomRef = useRef<HTMLDivElement | null>(null)
	const roomHeaderRef = useRef<HTMLDivElement | null>(null)
	const {fetchMore, posts} = usePostsForRoom(room.id)
	const [scrollBottom, setScrollBottom] = useState<number>(0)

	const handleScroll = useCallback(() => {
		if (!(roomHeaderRef.current && roomRef.current)) return
		setScrollBottom(roomRef.current.scrollHeight - roomRef.current.scrollTop - roomRef.current.clientHeight)
		if (roomRef.current.scrollTop < SCROLL_TOP_THRESHOLD + roomHeaderRef.current.clientHeight)
			fetchMore()
	}, [posts])

	useEffect(() => {
		if (!roomRef.current) return
		roomRef.current.scrollTo(0, roomRef.current.scrollHeight - roomRef.current.clientHeight - scrollBottom)
	}, [posts])

	return (
		<div className={styles.room} ref={roomRef} onScroll={handleScroll}>
			<div className={styles.roomHeader} ref={roomHeaderRef}>
				<h2>{room.name}</h2>
				<p className={styles.roomCreatedAt}>{`Created ${formatAgo(new Date(room.createdAt * 1000))}`}</p>
				{room.description && <p>{room.description}</p>}
			</div>
			<div className={styles.posts}>
				{posts.map((post) => <Post key={post.id} post={post} />)}
			</div>
			<NewPostForm room={room} />
		</div>
	)
}

export default function Room() {
	const openRoom = useOpenRoom()
	const {name} = useParams()
	const [room, setRoom] = useState<RoomModel | null>(null)

	useEffect(() => {
		async function loadRoom(name: string) {
			const loadedRoom = await openRoom(name)
			if (loadedRoom) setRoom(loadedRoom)
		}
		if (name) loadRoom(name)
	}, [name])

	if (!room) return (
		<div className={styles.room}>
			<Loading />
		</div>
	)

	return <Posts room={room} />
}