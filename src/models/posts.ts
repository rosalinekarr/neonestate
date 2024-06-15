import { buildRequest } from "../utils";
import { Auth } from "../hooks/useAuth";

interface BasePostSection {
  id: string;
}

export interface PostAttachmentSection extends BasePostSection {
  type: "attachment";
  path: string;
}

export interface PostTextSection extends BasePostSection {
  type: "text";
  body: string;
}

export type PostSection = PostAttachmentSection | PostTextSection;

export interface Post {
  id: string;
  sections: PostSection[];
  roomId: string;
  createdAt: number;
  authorId: string;
}

export interface GetPostsOpts {
  authorId?: string;
  createdBefore?: number;
  roomId?: string;
}

export async function getPosts(
  auth: Auth,
  queryOpts: GetPostsOpts,
): Promise<Post[]> {
  const response = await fetch(
    await buildRequest(auth, "GET", "/posts", queryOpts),
  );
  return response.json() as Promise<Post[]>;
}

export async function createPost(
  auth: Auth,
  post: Omit<Post, "id" | "authorId" | "createdAt">,
): Promise<Post> {
  const response = await fetch(
    await buildRequest(auth, "POST", "/posts", post),
  );
  return response.json() as Promise<Post>;
}
