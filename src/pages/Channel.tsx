import {ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState} from 'react'
import {Loading, Post} from '../components'
import {Channel as ChannelModel, getChannelByName} from '../models/channel'
import {Post as PostModel, createPost, listenForNewPosts, listPostsForChannel} from '../models/posts'
import { useAuth, useFirebaseApp } from '../hooks'
import { useParams } from 'react-router-dom'
import { formatAgo, uniqBy } from '../utils'
import { Timestamp } from 'firebase/firestore'
import { CreateIcon } from '../components/icons'
import styles from './Channel.module.css'

const SCROLL_TOP_THRESHOLD = 10

interface NewPostFormProps {
	channel: ChannelModel;
}

function NewPostForm({channel}: NewPostFormProps) {
	const app = useFirebaseApp()
	const auth = useAuth()
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
	const [body, setBody] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		await createPost(app, {
			body,
			channelId: channel.id,
			userId: auth.uid,
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
	posts: PostModel[];
}

function Posts({posts}: PostsProps) {
	return (
		<div className={styles.posts}>
			{posts.map((post) => <Post key={post.id} post={post} />)}
		</div>
	)
}

export default function Channel() {
	const app = useFirebaseApp()
	const {name} = useParams()
	const channelRef = useRef<HTMLDivElement | null>(null)
	const channelHeaderRef = useRef<HTMLDivElement | null>(null)
	const [channel, setChannel] = useState<ChannelModel | null>(null)
	const [posts, setPosts] = useState<PostModel[]>([])
	const [scrollBottom, setScrollBottom] = useState<number>(0)

	const handleScroll = useCallback(() => {
		if (!(channelHeaderRef.current && channelRef.current)) return
		setScrollBottom(channelRef.current.scrollHeight - channelRef.current.scrollTop - channelRef.current.clientHeight)
		if (channelRef.current.scrollTop < SCROLL_TOP_THRESHOLD + channelHeaderRef.current.clientHeight) {
			loadMorePosts(posts[0].createdAt)
		}
	}, [posts])

	const loadMorePosts = useCallback(async (cursor: Timestamp = Timestamp.now()) => {
		if (!(channel && channelRef.current)) return
		const newPosts = await listPostsForChannel(app, channel.id, cursor)
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
	}, [channel, posts])

	useEffect(() => {
		async function loadChannel(channelName: string) {
			const channel = await getChannelByName(app, channelName)
			if (channel) setChannel(channel)
		}
		if (name) loadChannel(name)
	}, [name])

	useEffect(() => {
		if (!channelRef.current) return
		channelRef.current.scrollTo(0, channelRef.current.scrollHeight - channelRef.current.clientHeight - scrollBottom)
	}, [posts])

	useEffect(() => {
		if (!channel) return
		setPosts((prevPosts) => prevPosts.filter(({channelId: cid}) => cid === channel.id))
		loadMorePosts()
	}, [channel])

	useEffect(
		() => {
			if (!channel) return
			return listenForNewPosts(app, channel.id, (newPost) => {
				setPosts(
					(previousPosts) => uniqBy(
						[...previousPosts, newPost],
						(post: PostModel) => post.id,
					),
				)
			})
		},
		[channel],
	)

	if (!channel) return (
		<div className={styles.channel}>
			<Loading />
		</div>
	)

	return (
		<div className={styles.channel} ref={channelRef} onScroll={handleScroll}>
			<div className={styles.channelHeader} ref={channelHeaderRef}>
				<h2>{`#${channel.name}`}</h2>
				<p className={styles.channelCreatedAt}>{`Created ${formatAgo(channel.createdAt.toDate())}`}</p>
				{channel.description && <p>{channel.description}</p>}
			</div>
			<Posts posts={posts} />
			<NewPostForm channel={channel} />
		</div>
	)
}