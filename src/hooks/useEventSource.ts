import { useContext } from "react";
import { SSEContext } from "../providers/SSEProvider";

export default function useEventSource(): EventSource {
  const eventSource = useContext(SSEContext);
  if (!eventSource)
    throw new Error(
      "Missing SSEContext: useSSE must only be invoked within AuthProvider",
    );
  return eventSource;
}
