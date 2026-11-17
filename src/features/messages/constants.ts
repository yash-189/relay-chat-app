import type { MessageStatus } from "./types";

export const MessageStatusLabels = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Send failed",
} satisfies Record<MessageStatus, string>;

export const DELETED_MESSAGE_LABEL = "This message was deleted";
