import { FormEvent, useEffect, useState } from "react";
import { Button, Loading, TextField } from "../components";
import { useEditRoom, useFetchRoom, useRoom } from "../hooks";
import { Room } from "../models/rooms";
import { useNavigate, useParams } from "react-router-dom";
import BackgroundField from "../components/BackgroundField";
import styles from "./EditRoom.module.css";

interface EditRoomFormProps {
  room: Room;
}

function EditRoomForm({ room }: EditRoomFormProps) {
  const editRoom = useEditRoom();
  const [description, setDescription] = useState<string>(room.description);
  const [backgroundPath, setBackgroundPath] = useState<string | undefined>(
    room.backgroundPath,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    await editRoom(room.id, {
      backgroundPath,
      description,
    });
    navigate(`/rooms/${room.name}`);
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.editRoom}>
      <div className={styles.editRoomContainer}>
        <h2>Edit Room</h2>
        <form onSubmit={handleSubmit}>
          <BackgroundField
            onChange={(path: string) => setBackgroundPath(path)}
            value={backgroundPath}
          />
          <TextField
            name="description"
            onChange={(newDescription) => setDescription(newDescription)}
            placeholder={`A community all about ${room.name}. Blah blah blah. More information about our community for ${room.name}.`}
            value={description}
          />
          <Button type="submit">Save Room</Button>
          <Button onClick={() => navigate(`/rooms/${room.name}`)}>
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function EditRoom() {
  const fetchRoom = useFetchRoom();
  const { name } = useParams();
  const room = useRoom(name || "");

  useEffect(() => {
    if (name) fetchRoom(name);
  }, [name]);

  if (!room) return <Loading />;

  return (
    <>
      <EditRoomForm room={room} />
    </>
  );
}
