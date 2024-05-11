import {ReactNode, createContext, useState} from 'react'
import { Post, getPosts } from '../models/posts'
import { useAuth } from '../hooks'

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
	const auth = useAuth()
	const [postsByRoom, setPostsByRoom] = useState<Record<string, Post[]>>({})
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function fetchMorePostsForRoom(roomId: string): Promise<void> {
		setIsLoading(true)
		const endTs = (postsByRoom[roomId] || [])[0]?.createdAt || Date.now()
		const fetchedPosts = await getPosts(auth, {
			roomId,
			createdBefore: endTs,
		})

		setPostsByRoom((prevVal) => ({
			...prevVal,
			[roomId]: [...fetchedPosts, ...prevVal[roomId] || []],
		}))
		setIsLoading(false)
	}

	return (
		<PostsContext.Provider value={{
			fetchMorePostsForRoom,
			isLoading,
			postsByRoom,
		}}>{children}</PostsContext.Provider>
	)
}