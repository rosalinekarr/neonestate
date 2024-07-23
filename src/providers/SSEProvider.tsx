import { ReactNode, createContext } from "react";
import { useAuth } from "../hooks";
import { getServerEventSource, ServerEventSource } from "../models/events";

interface SSEProviderProps {
  children: ReactNode;
}

export const SSEContext = createContext<ServerEventSource | null>(null);

export default function SSEProvider({ children }: SSEProviderProps) {
  const auth = useAuth();
  const eventSource = getServerEventSource(auth);

  return (
    <SSEContext.Provider value={eventSource}>{children}</SSEContext.Provider>
  );
}
