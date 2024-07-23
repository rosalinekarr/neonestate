import { Auth } from "../hooks/useAuth";
import { buildRequest } from "../utils";
import { Post } from "./posts";
import { User } from "./users";

export class PostCreatedEvent extends CustomEvent<Post> {}
export class UserCreatedEvent extends CustomEvent<User> {}
export class UserUpdatedEvent extends CustomEvent<User> {}

export type ServerEventMappings = {
  readonly postcreated: PostCreatedEvent;
  readonly usercreated: UserCreatedEvent;
  readonly userupdated: UserUpdatedEvent;
};

export type ServerEventType = keyof ServerEventMappings;
export type ServerEvent = ServerEventMappings[ServerEventType];
export type ServerEventListener<E extends ServerEvent> = (e: E) => void;

export class ServerEventSource extends EventTarget {
  public subscribe<T extends ServerEventType>(
    type: T,
    listener: ServerEventListener<ServerEventMappings[T]>,
  ): () => void {
    super.addEventListener(type, listener as EventListener);
    return () => super.removeEventListener(type, listener as EventListener);
  }

  public dispatchEvent(e: ServerEvent): boolean {
    return super.dispatchEvent(e);
  }
}

export const EVENT_TYPES = ["postcreated", "usercreated", "userupdated"];

export function getServerEventSource(auth: Auth): ServerEventSource {
  async function fetchEvents(eventTarget: EventTarget) {
    const response = await fetch(await buildRequest(auth, "GET", "/events"));

    if (response.status !== 200)
      throw new Error(`Server responded with status ${response.status}`);
    if (response.body === null)
      throw new Error("Server responded with a null body");

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let done = false;
    let buffer = "";

    while (!done) {
      const { value: chunk, done: lastChunk } = await reader.read();
      if (chunk) buffer += chunk;
      const bufferSections = buffer.split("\n\n");
      const serverEvents = bufferSections.slice(0, -1).map((rawEvent) => {
        console.log("rawEvent", rawEvent);
        const serverEvent = Object.fromEntries(
          rawEvent.split("\n").map((rawEntry) => {
            console.log("rawEntry", rawEntry);
            const entry = rawEntry.split(": ");
            if (entry.length !== 2)
              throw new Error(
                "Server responded with invalid event stream format",
              );
            return entry;
          }),
        );
        if (!EVENT_TYPES.includes(serverEvent["event"]))
          throw new Error("Server responded with invalid event type");
        return {
          type: serverEvent["event"],
          data: JSON.parse(serverEvent["data"]),
        };
      });
      serverEvents.forEach(({ type, data: detail }) =>
        eventTarget.dispatchEvent(new CustomEvent(type, { detail })),
      );
      buffer = bufferSections[bufferSections.length - 1];
      done = lastChunk;
    }
  }

  const serverEventsSource = new ServerEventSource();
  fetchEvents(serverEventsSource);
  return serverEventsSource;
}
