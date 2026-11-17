import type { ChatEvents } from "./types";

// stands in for a websocket: the mock server emits, feature api.ts files subscribe

type Handler<T> = (data: T) => void;

class EventEmitter {
  private listeners = new Map<keyof ChatEvents, Set<Handler<unknown>>>();

  subscribe<E extends keyof ChatEvents>(
    event: E,
    handler: Handler<ChatEvents[E]>,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as Handler<unknown>);

    return () => {
      set?.delete(handler as Handler<unknown>);
    };
  }

  emit<E extends keyof ChatEvents>(event: E, data: ChatEvents[E]): void {
    const set = this.listeners.get(event);
    if (!set) return;

    for (const handler of Array.from(set)) {
      handler(data);
    }
  }
}

export const chatEmitter = new EventEmitter();
