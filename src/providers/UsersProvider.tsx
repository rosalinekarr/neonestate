import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth, useServerEvents } from "../hooks";
import { UserCreatedEvent, UserUpdatedEvent } from "../models/events";
import { User, getProfile, getUser, updateProfile } from "../models/users";
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
  const serverEvents = useServerEvents();
  const firebaseUser = useContext(AuthContext);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(
    () => (currentUserId ? users[currentUserId] : null),
    [currentUserId, users],
  );

  function handleUserCreated(e: UserCreatedEvent) {
    console.log("usercreated", e);
    setUsers((prevUsers) => ({
      ...prevUsers,
      [e.detail.id]: e.detail,
    }));
  }

  function handleUserUpdated(e: UserUpdatedEvent) {
    console.log("userupdated", e);
    setUsers((prevUsers) => ({
      ...prevUsers,
      [e.detail.id]: e.detail,
    }));
  }

  async function updateCurrentUserProfile({
    avatarPath,
    username,
  }: Omit<User, "id" | "createdAt">) {
    if (!firebaseUser)
      throw new Error(
        "Missing AuthContext: UsersProvider must only be used within AuthProvider",
      );
    const updatedProfile = await updateProfile(auth, {
      avatarPath,
      username,
    });
    setUsers((prevUsers) => ({
      ...prevUsers,
      [updatedProfile.id]: updatedProfile,
    }));
    setCurrentUserId(updatedProfile.id);
  }

  async function fetchUser(id: string): Promise<User | null> {
    if (users[id]) return users[id];

    const user = await getUser(auth, id);
    if (user) {
      setUsers((prevUsers) => ({
        ...prevUsers,
        [id]: user,
      }));
    }

    return user;
  }

  useEffect(() => {
    const unsubscribeFns = [
      serverEvents.subscribe("usercreated", handleUserCreated),
      serverEvents.subscribe("userupdated", handleUserUpdated),
    ];

    return () => {
      unsubscribeFns.forEach((fn) => fn());
    };
  }, [serverEvents]);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!firebaseUser)
        throw new Error(
          "Missing AuthContext: UsersProvider must only be used within AuthProvider",
        );
      const user = await getProfile(auth);
      if (user) {
        setUsers((prevUsers) => ({
          ...prevUsers,
          [user.id]: user,
        }));
        setCurrentUserId(user.id);
      }
      setIsLoading(false);
    }

    loadCurrentUser();
  }, []);

  if (isLoading) return <Loading />;

  if (currentUser === null)
    return <CreateAccount onSubmit={updateCurrentUserProfile} />;

  return (
    <UsersContext.Provider
      value={{
        currentUser,
        fetchUser,
        updateProfile: updateCurrentUserProfile,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
