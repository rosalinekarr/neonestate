import { useContext } from "react";
import { SSEContext } from "../providers/SSEProvider";
import { ServerEventSource } from "../models/events";

export default function useServerEvents(): ServerEventSource {
  const eventSource = useContext(SSEContext);
  if (!eventSource)
    throw new Error(
      "Missing SSEContext: useSSE must only be invoked within AuthProvider",
    );
  return eventSource;
}
