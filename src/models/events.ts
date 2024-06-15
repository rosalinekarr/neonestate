import { Post } from "./posts";
import { User } from "./users";

export interface UserCreatedEvent {
  data: User;
}

export interface UserUpdatedEvent {
  data: User;
}

export interface PostCreatedEvent {
  data: Post;
}

export interface PostUpdatedEvent {
  data: Post;
}

export interface PostDeletedEvent {
  data: string;
}
