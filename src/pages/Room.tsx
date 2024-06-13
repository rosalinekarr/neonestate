import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  Loading,
  NewPostForm,
  Post,
  TextField,
} from "../components";
import { Room as RoomModel } from "../models/rooms";
import {
  useCurrentUser,
  useFetchRoom,
  useImage,
  usePermissions,
  usePostsForRoom,
  useRoom,
  useStartRoom,
} from "../hooks";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { formatAgo } from "../utils";
import { EditIcon } from "../components/icons";
import styles from "./Room.module.css";
import Ad from "../components/Ad";
import BackgroundField from "../components/BackgroundField";

const SCROLL_TOP_THRESHOLD = 10;

interface NewRoomFormProps {
  name: string;
}

function NewRoomForm({ name }: NewRoomFormProps) {
  const startRoom = useStartRoom();
  const [description, setDescription] = useState<string>("");
  const [backgroundPath, setBackgroundPath] = useState<string | undefined>(
    undefined,
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startRoom({
      backgroundPath,
      description,
      name,
    });
  }

  return (
    <div className={styles.room}>
      <div className={styles.roomContainer}>
        <h2>Start a New Room</h2>
        <form onSubmit={handleSubmit}>
          <BackgroundField
            onChange={(path) => setBackgroundPath(path)}
            value={backgroundPath}
          />
          <TextField
            name="description"
            onChange={(newDescription) => setDescription(newDescription)}
            placeholder={`A community all about ${name}. Blah blah blah. More information about our community for ${name}.`}
            value={description}
          />
          <Button type="submit">Create Room</Button>
        </form>
      </div>
    </div>
  );
}

interface PostsProps {
  room: RoomModel;
}

function Posts({ room }: PostsProps) {
  const roomRef = useRef<HTMLDivElement | null>(null);
  const { fetchMore, posts } = usePostsForRoom(room.id);
  const backgroundUrl = useImage(room?.backgroundPath);
  const [scrollBottom, setScrollBottom] = useState<number>(0);

  const handleScroll = useCallback(() => {
    if (!roomRef.current) return;
    setScrollBottom(
      roomRef.current.scrollHeight -
        roomRef.current.scrollTop -
        roomRef.current.clientHeight,
    );
    if (roomRef.current.scrollTop < SCROLL_TOP_THRESHOLD) fetchMore();
  }, [posts]);

  useEffect(() => {
    if (!roomRef.current) return;
    roomRef.current.scrollTo(
      0,
      roomRef.current.scrollHeight -
        roomRef.current.clientHeight -
        scrollBottom,
    );
  }, [posts]);

  return (
    <div
      className={styles.posts}
      onScroll={handleScroll}
      ref={roomRef}
      style={
        backgroundUrl ? { backgroundImage: `url('${backgroundUrl}')` } : {}
      }
    >
      {posts
        .map((post, index) => [
          <Post key={post.id} post={post} />,
          ...(index % 5 === 4 ? [<Ad />] : []),
        ])
        .flat()}
    </div>
  );
}

export default function Room() {
  const fetchRoom = useFetchRoom();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { name } = useParams();
  const room = useRoom(name || "");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFooter, _setShowFooter] = useState<boolean>(true);
  const [showHeader, _setShowHeader] = useState<boolean>(true);
  const { canEditRoom } = usePermissions(room, user);

  useEffect(() => {
    async function loadRoom(name: string) {
      await fetchRoom(name);
      setIsLoading(false);
    }
    if (name) loadRoom(name);
  }, [name]);

  if (!name) return <Navigate to="/" />;

  if (isLoading)
    return (
      <div className={styles.room}>
        <Loading />
      </div>
    );

  if (!room) return <NewRoomForm name={name} />;

  return (
    <div className={styles.room}>
      <div
        className={[
          styles.roomHeader,
          ...(showHeader ? [] : [styles.roomHeaderHidden]),
        ].join(" ")}
      >
        <div className={styles.roomHeaderContainer}>
          <h2>{room.name}</h2>
          {canEditRoom && (
            <IconButton
              icon={EditIcon}
              onClick={() => navigate(`/rooms/${room.name}/edit`)}
            />
          )}
          <p
            className={styles.roomCreatedAt}
          >{`Created ${formatAgo(new Date(room.createdAt * 1000))}`}</p>
          {room.description && (
            <p className={styles.roomDescription}>{room.description}</p>
          )}
        </div>
      </div>
      <Posts room={room} />
      <NewPostForm room={room} show={showFooter} />
    </div>
  );
}
