import { ReactNode, createContext, useEffect, useState } from "react";
import { PostCreatedEvent } from "../models/events";
import { Post, getPosts } from "../models/posts";
import { useAuth, useServerEvents } from "../hooks";
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
  const serverEvents = useServerEvents();
  const auth = useAuth();
  const [postsByRoom, setPostsByRoom] = useState<Record<string, Post[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handlePostCreated(e: PostCreatedEvent) {
    console.log("postcreated", e);
    setPostsByRoom((prevVal) => {
      return {
        ...prevVal,
        [e.detail.roomId]: sortBy(
          uniqBy(
            [...(prevVal[e.detail.roomId] || []), e.detail],
            (p: Post) => p.id,
          ),
          (p: Post) => p.createdAt,
        ),
      };
    });
  }

  async function fetchMorePostsForRoom(roomId: string): Promise<void> {
    setIsLoading(true);
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
    const unsubscribe = serverEvents.subscribe(
      "postcreated",
      handlePostCreated,
    );
    return unsubscribe;
  }, []);

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
