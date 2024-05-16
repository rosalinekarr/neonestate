import {ReactNode, createContext, useEffect, useState} from 'react'
import { Post, getPosts, listenForNewPosts } from '../models/posts'
import { useAuth, useFirebaseApp } from '../hooks'
import uniqBy from '../utils/uniqBy'
import sortBy from '../utils/sortBy'

interface PostsProviderProps {
	children: ReactNode;
}

interface PostsContext {
	fetchMorePostsForRoom: (roomId: string) => Promise<void>;
	isLoading: boolean;
	postsByRoom: Record<string, Post[]>;
}

export const PostsContext = createContext<PostsContext | null>(null)

export default function PostsProvider({children}: PostsProviderProps) {
	const app = useFirebaseApp()
	const auth = useAuth()
	const [postsByRoom, setPostsByRoom] = useState<Record<string, Post[]>>({})
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const roomIds = Object.keys(postsByRoom)

	async function fetchMorePostsForRoom(roomId: string): Promise<void> {
		setIsLoading(true)
		const endTs = (postsByRoom[roomId] || [])[0]?.createdAt || Date.now()
		const fetchedPosts = await getPosts(auth, {
			roomId,
			createdBefore: endTs,
		})

		setPostsByRoom((prevVal) => ({
			...prevVal,
			[roomId]: sortBy(
				uniqBy(
					[...fetchedPosts, ...prevVal[roomId] || []],
					(p: Post) => p.id,
				),
				(p: Post) => p.createdAt,
			),
		}))
		setIsLoading(false)
	}

	useEffect(() => {
		if (roomIds.length === 0) return

		const unsubscribe = listenForNewPosts(app, roomIds, (post: Post) => {
			setPostsByRoom((prevVal) => ({
				...prevVal,
				[post.roomId]: sortBy(
					uniqBy(
						[...prevVal[post.roomId] || [], post],
						(p: Post) => p.id,
					),
					(p: Post) => p.createdAt,
				),
			}))
		})

		return () => unsubscribe()
	}, [roomIds])

	return (
		<PostsContext.Provider value={{
			fetchMorePostsForRoom,
			isLoading,
			postsByRoom,
		}}>{children}</PostsContext.Provider>
	)
}