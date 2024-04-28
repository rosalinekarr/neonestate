import {ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState} from 'react'
import {Post} from '../components'
import {Post as PostModel, createPost, listenForNewPosts, listPostsForChannel} from '../models/posts'
import { useCurrentUser, useFirebaseApp } from '../hooks'
import { useParams } from 'react-router-dom'
import { uniqBy } from '../utils'
import { Timestamp } from 'firebase/firestore'
import { CreateIcon } from '../components/icons'

const SCROLL_TOP_THRESHOLD = 20

interface NewPostFormProps {
	channelId: string;
}

function NewPostForm({channelId}: NewPostFormProps) {
	const app = useFirebaseApp()
	const user = useCurrentUser()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const [body, setBody] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await createPost(app, {
			body,
			channelId,
			userId: user.uid,
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
		<form onSubmit={handleSubmit} className='new-post-form'>
			<textarea disabled={isLoading} ref={textAreaRef} rows={1} value={body} onChange={handleChange} />
			<button type='submit' disabled={isLoading}>
				<CreateIcon />
			</button>
		</form>
	)
}

export default function Channel() {
	const app = useFirebaseApp()
	const {channelId} = useParams()
	const channelRef = useRef<HTMLDivElement | null>(null)
	const [posts, setPosts] = useState<PostModel[]>([])
	const [scrollBottom, setScrollBottom] = useState<number>(0)

	const loadMorePosts = useCallback(async (cursor: Timestamp = Timestamp.now()) => {
		if (!channelRef.current) return
		const newPosts = await listPostsForChannel(app, channelId || 'home', cursor)
		if (newPosts.length > 0) {
			setPosts(
				(previousPosts) => uniqBy(
					[...newPosts, ...previousPosts],
					(post: PostModel) => post.id,
				).sort((a, b) => +a.createdAt.toDate() - +b.createdAt.toDate()),
			)
			if (channelRef.current.scrollHeight <= channelRef.current.clientHeight)
				await loadMorePosts(newPosts[0].createdAt)
		}
	}, [channelId, posts])

	const handleScroll = useCallback(() => {
		if (!channelRef.current) return
		setScrollBottom(channelRef.current.scrollHeight - channelRef.current.scrollTop - channelRef.current.clientHeight)
		if (channelRef.current.scrollTop < SCROLL_TOP_THRESHOLD) {
			loadMorePosts(posts[0].createdAt)
		}
	}, [posts])

	useEffect(() => {
		setPosts((prevPosts) => prevPosts.filter(({channelId: cid}) => cid === channelId))
		loadMorePosts()
	}, [channelId])

	useEffect(
		() => listenForNewPosts(app, channelId || 'home', (newPost) => {
			setPosts(
				(previousPosts) => uniqBy(
					[...previousPosts, newPost],
					(post: PostModel) => post.id,
				),
			)
		}),
		[channelId],
	)

	useEffect(() => {
		if (!channelRef.current) return
		channelRef.current.scrollTo(0, channelRef.current.scrollHeight - channelRef.current.clientHeight - scrollBottom)
	}, [posts])

	return (
		<div className='channel'>
			<div className='posts' onScroll={handleScroll} ref={channelRef}>
				{posts.map((post) => <Post key={post.id} post={post} />)}
			</div>
			<NewPostForm channelId={channelId || ''} />
		</div>
	)
}