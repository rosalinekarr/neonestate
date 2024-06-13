import { FormEvent, useState } from "react";
import { AvatarField, Button, Loading, TextField } from "../components";
import { User } from "../models/users";
import styles from "./CreateAccount.module.css";

interface CreateAccountProps {
  onSubmit: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
}

export default function CreateAccount({ onSubmit }: CreateAccountProps) {
  const [avatarPath, setAvatarPath] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined,
  );

  function handleAvatarChange(newAvatarPath: string) {
    setAvatarPath(newAvatarPath);
    setAvatarError(undefined);
  }

  function handleUsernameChange(newUsername: string) {
    setUsername(newUsername);
    setUsernameError(undefined);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!avatarPath || !username) {
      if (!avatarPath) setAvatarError("Avatar is required");
      if (!username) setUsernameError("Username is required");
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        avatarPath,
        username,
      });
    } catch (e: any) {
      setUsernameError(e.message);
    }
    setIsLoading(false);
  }

  if (isLoading) return <Loading />;

  return (
    <div className={styles.createAccount}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} role="form">
        <AvatarField
          error={avatarError}
          onChange={handleAvatarChange}
          value={avatarPath || ""}
        />
        <TextField
          name="username"
          error={usernameError}
          onChange={handleUsernameChange}
          placeholder="Johnny Mnemonic"
          value={username || ""}
        />
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
