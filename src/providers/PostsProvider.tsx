import { ReactNode, createContext, useEffect, useState } from "react";
import {
  PostCreatedEvent,
  PostUpdatedEvent,
  PostDeletedEvent,
} from "../models/events";
import { Post, getPosts } from "../models/posts";
import { useAuth, useEventSource } from "../hooks";
import uniqBy from "../utils/uniqBy";
import sortBy from "../utils/sortBy";

interface PostsProviderProps {
  children: ReactNode;
}

interface PostsContext {
  fetchMorePostsForRoom: (roomId: string) => Promise<void>;
  isLoading: boolean;
  postsByRoom: Record<string, Post[]>;
}

export const PostsContext = createContext<PostsContext | null>(null);

export default function PostsProvider({ children }: PostsProviderProps) {
  const eventSource = useEventSource();
  const auth = useAuth();
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [postsByRoom, setPostsByRoom] = useState<Record<string, Post[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handlePostCreated(e: PostCreatedEvent) {
    const post = JSON.parse(e.data);
    setPostsByRoom((prevVal) => {
      return {
        ...prevVal,
        [post.roomId]: sortBy(
          uniqBy([...(prevVal[post.roomId] || []), post], (p: Post) => p.id),
          (p: Post) => p.createdAt,
        ),
      };
    });
  }

  function handlePostUpdated(e: PostUpdatedEvent) {
    const post = JSON.parse(e.data);
    setPostsByRoom((prevVal) => {
      return {
        ...prevVal,
        [post.roomId]: sortBy(
          uniqBy([...(prevVal[post.roomId] || []), post], (p: Post) => p.id),
          (p: Post) => p.createdAt,
        ),
      };
    });
  }

  function handlePostDeleted(e: PostDeletedEvent) {
    const postId = JSON.parse(e.data);
    setPostsByRoom((prevVal) =>
      Object.fromEntries(
        Object.entries(prevVal).map(([key, posts]) => [
          key,
          posts.filter((post) => post.id !== postId),
        ]),
      ),
    );
  }

  async function fetchMorePostsForRoom(roomId: string): Promise<void> {
    setIsLoading(true);
    setRoomIds((prevRoomIds) =>
      uniqBy([...prevRoomIds, roomId], (a: string) => a),
    );
    const endTs = (postsByRoom[roomId] || [])[0]?.createdAt || Date.now();
    const fetchedPosts = await getPosts(auth, {
      roomId,
      createdBefore: Math.floor(endTs / 1000),
    });

    setPostsByRoom((prevVal) => ({
      ...prevVal,
      [roomId]: sortBy(
        uniqBy(
          [...fetchedPosts, ...(prevVal[roomId] || [])],
          (p: Post) => p.id,
        ),
        (p: Post) => p.createdAt,
      ),
    }));
    setIsLoading(false);
  }

  useEffect(() => {
    if (roomIds.length === 0) return;

    eventSource.addEventListener("postcreated", handlePostCreated);
    eventSource.addEventListener("postupdated", handlePostUpdated);
    eventSource.addEventListener("postdeleted", handlePostDeleted);

    return () => {
      eventSource.removeEventListener("postcreated", handlePostCreated);
      eventSource.removeEventListener("postupdated", handlePostUpdated);
      eventSource.removeEventListener("postdeleted", handlePostDeleted);
    };
  }, [roomIds]);

  return (
    <PostsContext.Provider
      value={{
        fetchMorePostsForRoom,
        isLoading,
        postsByRoom,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}
