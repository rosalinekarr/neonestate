import { useContext, useEffect } from "react";
import { PostsContext } from "../providers/PostsProvider";

export default function usePostsForRoom(roomId: string) {
  const postsContext = useContext(PostsContext);
  if (!postsContext)
    throw new Error(
      "Missing PostsContext: usePostsForRoom must only be invoked within PostsContext",
    );

  const { fetchMorePostsForRoom, isLoading, postsByRoom } = postsContext;

  useEffect(() => {
    fetchMorePostsForRoom(roomId);
  }, []);

  return {
    fetchMore: () => fetchMorePostsForRoom(roomId),
    isLoading,
    posts: postsByRoom[roomId] || [],
  };
}
