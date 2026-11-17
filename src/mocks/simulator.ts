import { CURRENT_USER_ID } from "./data";
import {
  insertIncomingMessage,
  listConversations,
  listUsers,
  toggleUserOnline,
  updateMessageStatus,
} from "./db";
import { chatEmitter } from "./emitter";
import type { MockMessage, MockMessageStatus } from "./types";

// plays the other users: sends them messages, flips their online status,
// moves your messages to delivered/read and sometimes types a reply, so the
// app has live events without a backend.

const MESSAGE_INTERVAL_MIN_MS = 8000;
const MESSAGE_INTERVAL_JITTER_MS = 7000;
const PRESENCE_TOGGLE_CHANCE = 0.6;
const DELIVERY_DELAY_MS = 1000;
const READ_DELAY_MS = 1800;
const REPLY_CHANCE = 0.5;
const TYPING_DELAY_MS = 600;
const TYPING_DURATION_MS = 2000;
const SIMULATOR_GLOBAL_KEY = "__CHAT_APP_MOCK_SIMULATOR_RUNNING__";

const INCOMING_TEXTS = [
  "Just checking in, did you get a chance to review that?",
  "Looks great to me, let's proceed with it!",
  "Could you check the latest pull request when you have a minute?",
  "Are we still on for the sync later today?",
  "Thanks for sharing that update, really helpful.",
  "I've updated the styles to match the latest specs.",
  "Quick question about the component hierarchy here.",
  "Awesome work on this release!",
];

const REPLY_TEXTS = [
  "Got it, thanks!",
  "Makes sense to me.",
  "I will review this right away.",
  "Let me test this on my branch.",
  "Looks good, heading over to check it now.",
  "Sounds like a plan!",
];

let timerId: ReturnType<typeof setTimeout> | null = null;
let stopTrackingOwnMessages: (() => void) | null = null;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function createIncomingMessage(
  conversationId: string,
  senderId: string,
  text: string,
): MockMessage {
  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    conversationId,
    senderId,
    text,
    createdAt: new Date().toISOString(),
    status: "delivered",
  };
}

function deliver(message: MockMessage) {
  insertIncomingMessage(message);
  chatEmitter.emit("message:new", message);
}

function emitStatus(messageId: string, status: MockMessageStatus) {
  const updated = updateMessageStatus(messageId, status);
  if (updated) chatEmitter.emit("message:updated", updated);
}

function onlineRecipients(conversationId: string): string[] {
  const conversation = listConversations().find((c) => c.id === conversationId);
  if (!conversation) return [];

  const onlineIds = new Set(
    listUsers()
      .filter((u) => u.isOnline)
      .map((u) => u.id),
  );
  return conversation.participantIds.filter(
    (id) => id !== CURRENT_USER_ID && onlineIds.has(id),
  );
}

function typeThenReply(conversationId: string, userId: string) {
  chatEmitter.emit("typing", { conversationId, userId, isTyping: true });

  setTimeout(() => {
    chatEmitter.emit("typing", { conversationId, userId, isTyping: false });
    deliver(
      createIncomingMessage(conversationId, userId, pickRandom(REPLY_TEXTS)),
    );
  }, TYPING_DURATION_MS);
}

// read only happens while someone on the other side is online
function markReadIfSomeoneOnline(message: MockMessage) {
  const recipients = onlineRecipients(message.conversationId);
  if (recipients.length === 0) return;

  emitStatus(message.id, "read");

  if (Math.random() < REPLY_CHANCE) {
    const responderId = pickRandom(recipients);
    setTimeout(
      () => typeThenReply(message.conversationId, responderId),
      TYPING_DELAY_MS,
    );
  }
}

function trackOwnMessage(message: MockMessage) {
  if (message.senderId !== CURRENT_USER_ID) return;

  setTimeout(() => {
    emitStatus(message.id, "delivered");
    setTimeout(() => markReadIfSomeoneOnline(message), READ_DELAY_MS);
  }, DELIVERY_DELAY_MS);
}

function sendRandomIncomingMessage() {
  const conversations = listConversations();
  if (conversations.length === 0) return;

  const conversation = pickRandom(conversations);
  const others = conversation.participantIds.filter(
    (id) => id !== CURRENT_USER_ID,
  );
  if (others.length === 0) return;

  deliver(
    createIncomingMessage(
      conversation.id,
      pickRandom(others),
      pickRandom(INCOMING_TEXTS),
    ),
  );
}

function toggleRandomPresence() {
  const others = listUsers().filter((u) => u.id !== CURRENT_USER_ID);
  if (others.length === 0) return;

  const user = pickRandom(others);
  const isOnline = toggleUserOnline(user.id);
  if (isOnline !== null) {
    chatEmitter.emit("presence:change", { userId: user.id, isOnline });
  }
}

function nextDelay() {
  return Math.floor(
    MESSAGE_INTERVAL_MIN_MS + Math.random() * MESSAGE_INTERVAL_JITTER_MS,
  );
}

function runSimulationStep() {
  sendRandomIncomingMessage();
  if (Math.random() < PRESENCE_TOGGLE_CHANCE) toggleRandomPresence();
  timerId = setTimeout(runSimulationStep, nextDelay());
}

export function startSimulator(): void {
  // one timer only, even with strict mode double effects and hot reloads
  const globalObj = globalThis as unknown as Record<
    string,
    boolean | undefined
  >;
  if (globalObj[SIMULATOR_GLOBAL_KEY]) return;
  globalObj[SIMULATOR_GLOBAL_KEY] = true;

  stopTrackingOwnMessages = chatEmitter.subscribe(
    "message:new",
    trackOwnMessage,
  );
  timerId = setTimeout(runSimulationStep, nextDelay());
}

export function stopSimulator(): void {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  stopTrackingOwnMessages?.();
  stopTrackingOwnMessages = null;

  const globalObj = globalThis as unknown as Record<
    string,
    boolean | undefined
  >;
  globalObj[SIMULATOR_GLOBAL_KEY] = false;
}
