import { CURRENT_USER_ID } from "./data";
import {
  insertIncomingMessage,
  listConversations,
  listUsers,
  toggleUserOnline,
} from "./db";
import { chatEmitter } from "./emitter";
import type { MockMessage } from "./types";

// plays the other users: sends them messages and flips their online status
// on a timer, so the app has live events without a backend.

const MESSAGE_INTERVAL_MIN_MS = 8000;
const MESSAGE_INTERVAL_JITTER_MS = 7000;
const PRESENCE_TOGGLE_CHANCE = 0.4;
const SIMULATOR_GLOBAL_KEY = "__CHAT_APP_MOCK_SIMULATOR_RUNNING__";

const SIMULATOR_MESSAGES = [
  "Just checking in, did you get a chance to review that?",
  "Looks great to me, let's proceed with it!",
  "Could you check the latest pull request when you have a minute?",
  "Are we still on for the sync later today?",
  "Thanks for sharing that update, really helpful.",
  "I've updated the styles to match the latest specs.",
  "Quick question about the component hierarchy here.",
  "Awesome work on this release!",
];

let timerId: ReturnType<typeof setTimeout> | null = null;

function runSimulationStep() {
  const conversations = listConversations();
  const users = listUsers();

  if (conversations.length > 0) {
    const convIndex = Math.floor(Math.random() * conversations.length);
    const targetConv = conversations[convIndex];

    const nonMeParticipants = targetConv.participantIds.filter(
      (id) => id !== CURRENT_USER_ID,
    );
    const senderId =
      nonMeParticipants.length > 0
        ? nonMeParticipants[
            Math.floor(Math.random() * nonMeParticipants.length)
          ]
        : "user-2";

    const randomText =
      SIMULATOR_MESSAGES[Math.floor(Math.random() * SIMULATOR_MESSAGES.length)];

    const newMessage: MockMessage = {
      id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      conversationId: targetConv.id,
      senderId,
      text: randomText,
      createdAt: new Date().toISOString(),
      status: "delivered",
    };

    insertIncomingMessage(newMessage);
    chatEmitter.emit("message:new", newMessage);
  }

  if (Math.random() > PRESENCE_TOGGLE_CHANCE && users.length > 1) {
    const nonMeUsers = users.filter((u) => u.id !== CURRENT_USER_ID);
    const targetUser =
      nonMeUsers[Math.floor(Math.random() * nonMeUsers.length)];
    const newStatus = toggleUserOnline(targetUser.id);
    if (newStatus !== null) {
      chatEmitter.emit("presence:change", {
        userId: targetUser.id,
        isOnline: newStatus,
      });
    }
  }

  const nextDelay = Math.floor(
    MESSAGE_INTERVAL_MIN_MS + Math.random() * MESSAGE_INTERVAL_JITTER_MS,
  );
  timerId = setTimeout(runSimulationStep, nextDelay);
}

export function startSimulator(): void {
  // one timer only, even with strict mode double effects and hot reloads
  const globalObj = globalThis as unknown as Record<
    string,
    boolean | undefined
  >;
  if (globalObj[SIMULATOR_GLOBAL_KEY]) {
    return;
  }
  globalObj[SIMULATOR_GLOBAL_KEY] = true;

  const initialDelay = Math.floor(
    MESSAGE_INTERVAL_MIN_MS + Math.random() * MESSAGE_INTERVAL_JITTER_MS,
  );
  timerId = setTimeout(runSimulationStep, initialDelay);
}

export function stopSimulator(): void {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  const globalObj = globalThis as unknown as Record<
    string,
    boolean | undefined
  >;
  globalObj[SIMULATOR_GLOBAL_KEY] = false;
}
