import { get, set } from "idb-keyval";
import type { MockConversation, MockMessage, MockUser } from "./types";

// bump when the seed data changes shape so old snapshots are ignored
const SNAPSHOT_KEY = "chat-mock-snapshot-v1";
// batches bursts (typing a reply, status ticks) into one write
const SAVE_DEBOUNCE_MS = 300;

export interface MockSnapshot {
  users: MockUser[];
  conversations: MockConversation[];
  messages: MockMessage[];
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

// no indexeddb on the server or in jsdom; the mock then stays in memory only
function canPersist() {
  return typeof indexedDB !== "undefined";
}

export async function loadSnapshot(): Promise<MockSnapshot | undefined> {
  if (!canPersist()) return undefined;
  try {
    return await get<MockSnapshot>(SNAPSHOT_KEY);
  } catch {
    return undefined;
  }
}

export function scheduleSave(readSnapshot: () => MockSnapshot): void {
  if (!canPersist()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    set(SNAPSHOT_KEY, readSnapshot()).catch(() => undefined);
  }, SAVE_DEBOUNCE_MS);
}
