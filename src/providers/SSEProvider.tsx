import { ReactNode, createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks";
import { Loading } from "../components";
import { buildEventSource } from "../utils";

interface SSEProviderProps {
  children: ReactNode;
}

export const SSEContext = createContext<EventSource | null>(null);

export default function SSEProvider({ children }: SSEProviderProps) {
  const auth = useAuth();
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    async function openEventStream(): Promise<() => void> {
      const newEventSource = await buildEventSource(auth);
      setEventSource(newEventSource);
      return () => newEventSource.close();
    }
    const closeFnPromse = openEventStream();

    return () => {
      async function closeEventStream() {
        const closeFn = await closeFnPromse;
        closeFn();
      }
      closeEventStream();
    };
  }, []);

  if (eventSource === null) return <Loading />;

  return (
    <SSEContext.Provider value={eventSource}>{children}</SSEContext.Provider>
  );
}
