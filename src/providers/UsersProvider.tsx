import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth, useEventSource } from "../hooks";
import { UserCreatedEvent, UserUpdatedEvent } from "../models/events";
import {
  User,
  createUser,
  getUser,
  isProfileComplete,
  updateUser,
} from "../models/users";
import { CreateAccount } from "../pages";
import { AuthContext } from "./AuthProvider";
import { Loading } from "../components";

interface UserProviderProps {
  children: ReactNode;
}

export interface UsersContext {
  currentUser: User;
  fetchUser: (id: string) => Promise<User | null>;
  updateProfile: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
}

export const UsersContext = createContext<UsersContext | null>(null);

export default function UsersProvider({ children }: UserProviderProps) {
  const auth = useAuth();
  const eventSource = useEventSource();
  const firebaseUser = useContext(AuthContext);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  function handleUserCreated(e: UserCreatedEvent) {
    const newUser = e.data;
    setUsers((prevUsers) => ({
      ...prevUsers,
      [newUser.id]: newUser,
    }));
  }

  function handleUserUpdated(e: UserUpdatedEvent) {
    const updatedUser = e.data;
    setUsers((prevUsers) => ({
      ...prevUsers,
      [updatedUser.id]: updatedUser,
    }));
  }

  async function createProfile({
    avatarPath,
    username,
  }: Omit<User, "id" | "createdAt">) {
    const newProfile = await createUser(auth, { avatarPath, username });
    setUsers((prevUsers) => ({
      ...prevUsers,
      [newProfile.id]: newProfile,
    }));
  }

  async function updateProfile({
    avatarPath,
    username,
  }: Omit<User, "id" | "createdAt">) {
    if (!firebaseUser)
      throw new Error(
        "Missing AuthContext: UsersProvider must only be used within AuthProvider",
      );
    const updatedProfile = await updateUser(auth, firebaseUser.uid, {
      avatarPath,
      username,
    });
    setUsers((prevUsers) => ({
      ...prevUsers,
      [firebaseUser.uid]: updatedProfile,
    }));
  }

  async function fetchUser(id: string): Promise<User | null> {
    if (users[id]) return users[id];

    const user = await getUser(auth, id);
    if (user)
      setUsers((prevUsers) => ({
        ...prevUsers,
        [id]: user,
      }));

    return user;
  }

  useEffect(() => {
    eventSource.addEventListener("usercreated", handleUserCreated);
    eventSource.addEventListener("userupdated", handleUserUpdated);

    return () => {
      eventSource.removeEventListener("usercreated", handleUserCreated);
      eventSource.removeEventListener("userupdated", handleUserUpdated);
    };
  }, [eventSource]);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!firebaseUser)
        throw new Error(
          "Missing AuthContext: UsersProvider must only be used within AuthProvider",
        );
      const user = await fetchUser(firebaseUser.uid);
      setCurrentUser(user);
      setIsLoading(false);
    }

    loadCurrentUser();
  }, []);

  if (isLoading) return <Loading />;

  if (!isProfileComplete(currentUser))
    return <CreateAccount onSubmit={createProfile} />;

  return (
    <UsersContext.Provider
      value={{
        currentUser,
        fetchUser,
        updateProfile,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
