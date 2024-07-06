import { ChangeEvent, FormEvent, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useFirebaseApp, useRooms } from "../hooks";
import { Room } from "../models/rooms";
import CreateIcon from "./icons/create";
import styles from "./Menu.module.css";
import { getAuth, signOut } from "firebase/auth";
import { DonateIcon, ProfileIcon, SignOutIcon } from "./icons";
import IconButton from "./IconButton";

interface OpenChannelFormProps {
  onSubmit: () => void;
}

function OpenChannelForm({ onSubmit }: OpenChannelFormProps) {
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value.replaceAll(/[^\w-_]/g, "_"));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(`/rooms/${name}`);
    setName("");
    onSubmit();
  }

  return (
    <form className={styles.menuNewChannelForm} onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        placeholder="open new channel"
        value={name}
      />
      <button type="submit">
        <CreateIcon />
      </button>
    </form>
  );
}

interface MenuProps {
  onClose: () => void;
  open: boolean;
}

export default function Menu({ onClose, open }: MenuProps) {
  const app = useFirebaseApp();
  const rooms = useRooms();
  const navigate = useNavigate();

  async function handleSignOut() {
    const auth = getAuth(app);
    await signOut(auth);

    // Intentionally not using react-router here to force a page refresh
    window.location.assign("/");
  }

  return (
    <nav className={[styles.menu, ...(open ? [styles.open] : [])].join(" ")}>
      <div className={styles.menuChannels}>
        {rooms.map((room: Room) => (
          <NavLink
            key={room.id}
            className={styles.menuItem}
            to={`/rooms/${room.name}`}
          >
            {room.name}
          </NavLink>
        ))}
        <OpenChannelForm onSubmit={onClose} />
      </div>
      <div className={styles.menuAccount}>
        <IconButton
          icon={DonateIcon}
          className={styles.menuItem}
          onClick={() => navigate("/donate")}
        >
          Donate
        </IconButton>
        <IconButton
          icon={ProfileIcon}
          className={styles.menuItem}
          onClick={() => navigate("/profile")}
        >
          Profile
        </IconButton>
        <IconButton
          icon={SignOutIcon}
          className={styles.menuItem}
          onClick={handleSignOut}
        >
          Sign out
        </IconButton>
      </div>
    </nav>
  );
}
