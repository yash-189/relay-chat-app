import { chatEmitter } from "./emitter";
import { startSimulator } from "./simulator";
import type { ChatEvents } from "./types";

// connecting starts the live events, like opening a socket
export function subscribe<E extends keyof ChatEvents>(
  event: E,
  handler: (data: ChatEvents[E]) => void,
) {
  startSimulator();
  return chatEmitter.subscribe(event, handler);
}
