import {ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState} from 'react'
import {Button, IconButton, Loading, Post, TextField} from '../components'
import {Room as RoomModel} from '../models/rooms'
import {PostSection, PostTextSection, createPost} from '../models/posts'
import { useAuth, useCurrentUser, useFetchRoom, useImage, usePermissions, usePostsForRoom, useRoom, useStartRoom } from '../hooks'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { formatAgo } from '../utils'
import { CreateIcon, EditIcon } from '../components/icons'
import styles from './Room.module.css'
import Ad from '../components/Ad'
import BackgroundField from '../components/BackgroundField'

const SCROLL_TOP_THRESHOLD = 10

interface NewRoomFormProps {
	name: string;
}

function NewRoomForm({name}: NewRoomFormProps) {
	const startRoom = useStartRoom()
	const [description, setDescription] = useState<string>('')
	const [backgroundPath, setBackgroundPath] = useState<string | undefined>(undefined)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		startRoom({
			backgroundPath,
			description,
			name,
		})
	}

	return (
		<div className={styles.room}>
			<div className={styles.roomContainer}>
				<h2>Start a New Room</h2>
				<form onSubmit={handleSubmit}>
					<BackgroundField onChange={(path) => setBackgroundPath(path)} value={backgroundPath} />
					<TextField
						name='description'
						onChange={(newDescription) => setDescription(newDescription)}
						placeholder={`A community all about ${name}. Blah blah blah. More information about our community for ${name}.`}
						value={description}
					/>
					<Button type='submit'>Create Room</Button>
				</form>
			</div>
		</div>
	)
}

interface NewPostTextSectionProps {
	onCreate: (newSections: PostTextSection[]) => void
	onDelete: () => void
	onMergeBack: () => void
	onUpdate: (updatedSection: PostTextSection) => void
	section: PostTextSection
	showPlaceholder: boolean
}

function generatePostTextSection(body: string): PostTextSection {
	return {
		id: crypto.randomUUID(),
		type: 'text',
		body,
	}
}

function NewPostTextSection({onCreate, onDelete, onMergeBack, onUpdate, section, showPlaceholder}: NewPostTextSectionProps) {
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

	function handleKeyDown(e: KeyboardEvent) {
		if (e.code === 'Delete' || e.code === 'Backspace') {
			if (section.body === '') onDelete()
			if (section.body !== '' && textAreaRef.current?.selectionStart === 0 && textAreaRef.current?.selectionEnd === 0) onMergeBack()
		}
	}

	function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
		const [firstBodyPart, ...newBodyParts] = e.target.value.split(/\r?\n/)

		if (e.target.value === '') {
			onDelete()
		} else if (newBodyParts.length > 0) {
			onUpdate({...section, body: firstBodyPart})
			onCreate(newBodyParts.map((body) => generatePostTextSection(body)))
		} else {
			onUpdate({...section, body: firstBodyPart})
		}
	}

	useEffect(() => {
		if (textAreaRef.current) textAreaRef.current.focus()
	}, [])

	useEffect(() => {
		if (!textAreaRef.current) return
		textAreaRef.current.style.minHeight = '0'
		textAreaRef.current.style.minHeight = `${textAreaRef.current?.scrollHeight}px`
	}, [section.body])

	return (
		<textarea
			className={styles.newPostTextSection}
			dir='auto'
			ref={textAreaRef}
			rows={1}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			placeholder={showPlaceholder ? 'Say something...' : undefined}
			value={section.body}
		/>
	)
}

interface NewPostSectionProps {
	onCreate: (newSections: PostSection[]) => void
	onDelete: () => void
	onMergeBack: () => void
	onUpdate: (updatedSection: PostSection) => void
	section: PostSection
	showPlaceholder: boolean
}

function NewPostSection({section, ...props}: NewPostSectionProps) {
	if (section.type === 'text') return <NewPostTextSection section={section} {...props} />
	return <p>Unsupported section type</p>
}

function generateBlankPostTextSection(): PostTextSection {
	return {
		id: crypto.randomUUID(),
		type: 'text',
		body: '',
	}
}

interface NewPostFormProps {
	room: RoomModel;
	show: boolean;
}

function NewPostForm({room, show}: NewPostFormProps) {
	const auth = useAuth()
	const [sections, setSections] = useState<PostSection[]>([generateBlankPostTextSection()])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await createPost(auth, {
			roomId: room.id,
			sections,
		})
		setSections([generateBlankPostTextSection()])
		setIsLoading(false)
	}

	return (
		<form onSubmit={handleSubmit} className={[styles.newPostForm, ...show ? [] : [styles.newPostFormHidden]].join(' ')}>
			<div className={styles.newPostFormContainer}>
				<div className={styles.newPostSections}>
					{sections.map((section: PostSection, index: number) =>
						<NewPostSection
							key={section.id}
							onCreate={(newSections: PostSection[]) =>
								setSections((prevSections: PostSection[]) =>
									prevSections.toSpliced(index + 1, 0, ...newSections),
								)
							}
							onDelete={() =>
								setSections((prevSections: PostSection[]) => {
									if (prevSections.length === 1)
										return [generateBlankPostTextSection()]
									if (index > 0) {
										const precedingSection = prevSections[index - 1]
										if (precedingSection.type === 'text')
											return prevSections.toSpliced(index - 1, 2, generatePostTextSection(precedingSection.body))
									}
									return prevSections.toSpliced(index, 1)
								})
							}
							onMergeBack={() => {
								setSections((prevSections: PostSection[]) => {
									if (index > 0) {
										const precedingSection = prevSections[index - 1]
										const currentSection = prevSections[index]
										if (currentSection.type === 'text' && precedingSection.type === 'text')
											return prevSections.toSpliced(index - 1, 2, generatePostTextSection(precedingSection.body + currentSection.body))
									}
									return prevSections
								})
							}}
							onUpdate={(updatedSection: PostSection) =>
								setSections((prevSections: PostSection[]) =>
									prevSections.toSpliced(index, 1, updatedSection),
								)
							}
							section={section}
							showPlaceholder={index === 0 && sections.length === 1}
						/>,
					)}
				</div>
				<button type='submit' className={styles.newPostButton} disabled={isLoading}>
					<CreateIcon />
					<span className={styles.newPostButtonText}>Post</span>
				</button>
			</div>
		</form>
	)
}

interface PostsProps {
	room: RoomModel;
}

function Posts({room}: PostsProps) {
	const roomRef = useRef<HTMLDivElement | null>(null)
	const {fetchMore, posts} = usePostsForRoom(room.id)
	const backgroundUrl = useImage(room?.backgroundPath)
	const [scrollBottom, setScrollBottom] = useState<number>(0)

	const handleScroll = useCallback(() => {
		if (!roomRef.current) return
		setScrollBottom(roomRef.current.scrollHeight - roomRef.current.scrollTop - roomRef.current.clientHeight)
		if (roomRef.current.scrollTop < SCROLL_TOP_THRESHOLD)
			fetchMore()
	}, [posts])

	useEffect(() => {
		if (!roomRef.current) return
		roomRef.current.scrollTo(0, roomRef.current.scrollHeight - roomRef.current.clientHeight - scrollBottom)
	}, [posts])

	return (
		<div
			className={styles.posts}
			onScroll={handleScroll}
			ref={roomRef}
			style={backgroundUrl ? {backgroundImage: `url('${backgroundUrl}')`} : {}}
		>
			{posts.map((post, index) => [<Post key={post.id} post={post} />, ...index % 5 === 4 ? [<Ad />] : []]).flat()}
		</div>
	)
}

export default function Room() {
	const fetchRoom = useFetchRoom()
	const navigate = useNavigate()
	const user = useCurrentUser()
	const {name} = useParams()
	const room = useRoom(name || '')
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [showFooter, _setShowFooter] = useState<boolean>(true)
	const [showHeader, _setShowHeader] = useState<boolean>(true)
	const {canEditRoom} = usePermissions(room, user)

	useEffect(() => {
		async function loadRoom(name: string) {
			await fetchRoom(name)
			setIsLoading(false)
		}
		if (name) loadRoom(name)
	}, [name])

	if (!name) return <Navigate to='/' />

	if (isLoading) return (
		<div className={styles.room}>
			<Loading />
		</div>
	)

	if (!room) return <NewRoomForm name={name} />

	return (
		<div className={styles.room}>
			<div className={[styles.roomHeader, ...showHeader ? [] : [styles.roomHeaderHidden]].join(' ')}>
				<div className={styles.roomHeaderContainer}>
					<h2>{room.name}</h2>
					{canEditRoom && <IconButton icon={EditIcon} onClick={() => navigate(`/rooms/${room.name}/edit`)} />}
					<p className={styles.roomCreatedAt}>{`Created ${formatAgo(new Date(room.createdAt * 1000))}`}</p>
					{room.description && <p className={styles.roomDescription}>{room.description}</p>}
				</div>
			</div>
			<Posts
				room={room}
			/>
			<NewPostForm room={room} show={showFooter} />
		</div>
	)
}