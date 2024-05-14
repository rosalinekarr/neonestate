import { useEffect, useState } from 'react'
import {User} from '../components'
import { Post as PostModel } from '../models/posts'
import {formatAgo, msUntilNextAgoFormatChange} from '../utils'
import styles from './Post.module.css'

interface TimestampProps {
	ts: Date;
}

function Timestamp({ts}: TimestampProps) {
	const [agoStr, setAgoStr] = useState<string>(formatAgo(ts))

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null

		function setTimeoutForAgoString() {
			timeoutId = setTimeout(() => {
				setAgoStr(formatAgo(ts))
				setTimeoutForAgoString()
			}, msUntilNextAgoFormatChange(ts))
		}

		setTimeoutForAgoString()
		return () => {
			if (timeoutId) clearInterval(timeoutId)
		}
	}, [])

	return (
		<p className={styles.postCreatedBy} title={ts.toISOString()}>
			{agoStr}
		</p>
	)
}

interface PostProps {
	post: PostModel;
}

export default function Post({post}: PostProps) {
	return (
		<article className={styles.post}>
			<div className={styles.postMetadata}>
        		<User id={post.authorId} />
				<Timestamp ts={new Date(post.createdAt * 1000)} />
			</div>
        	<p className={styles.postBody}>{post.body}</p>
		</article>
	)
}