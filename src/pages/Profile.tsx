import { getAuth, signOut } from "firebase/auth";
import { FormEvent, useState } from "react";
import {
  useCurrentUser,
  useFirebaseApp,
  useImage,
  useUpdateProfile,
} from "../hooks";
import styles from "./Profile.module.css";
import { AvatarField, Button, Loading, TextField } from "../components";
import { useNavigate } from "react-router-dom";

interface ProfileFormProps {
  onClose?: () => void;
}

export function ProfileForm({ onClose }: ProfileFormProps) {
  const user = useCurrentUser();
  const [avatarPath, setAvatarPath] = useState<string>(user?.avatarPath || "");
  const [username, setUsername] = useState<string>(user?.username || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const updateProfile = useUpdateProfile();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);
    try {
      await updateProfile({
        avatarPath,
        username,
      });

      onClose && onClose();
    } catch (e: any) {
      setError(e.toString());
      setIsLoading(false);
    }
  }

  if (isLoading) return <Loading />;

  return (
    <form onSubmit={handleSubmit}>
      <AvatarField
        onChange={(path) => setAvatarPath(path)}
        value={avatarPath}
      />
      <TextField
        error={error}
        name="username"
        onChange={(newUsername) => setUsername(newUsername)}
        placeholder="Johnny Mnemonic"
        value={username}
      />
      <Button type="submit">Save</Button>
      {onClose && <Button onClick={() => onClose()}>Cancel</Button>}
    </form>
  );
}

interface ProfileInfoProps {
  onEdit: () => void;
}

export function ProfileInfo({ onEdit }: ProfileInfoProps) {
  const user = useCurrentUser();
  const app = useFirebaseApp();
  const avatarUrl = useImage(user.avatarPath);
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const auth = getAuth(app);
    await signOut(auth);
    navigate("/");
  }

  if (isSigningOut) return <Loading />;

  return (
    <div>
      {avatarUrl && <img src={avatarUrl} className={styles.avatar} />}
      <p>{user?.username || ""}</p>
      <Button onClick={() => onEdit()}>Edit</Button>
      <Button onClick={() => handleSignOut()}>Sign out</Button>
    </div>
  );
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <div className={styles.profile}>
      <div className={styles.profileContainer}>
        <h2>Edit Profile</h2>
        {isEditing ? (
          <ProfileForm onClose={() => setIsEditing(false)} />
        ) : (
          <ProfileInfo onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  );
}
