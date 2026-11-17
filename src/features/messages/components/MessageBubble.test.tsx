import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CURRENT_USER_ID } from "../api";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";

describe("MessageBubble", () => {
  const baseMessage: Message = {
    id: "msg-1",
    conversationId: "conv-1",
    senderId: "user-other",
    text: "Hello from the other side!",
    createdAt: new Date().toISOString(),
    status: "delivered",
  };

  it("renders incoming message with sender name and avatar in group context", () => {
    render(
      <MessageBubble
        message={baseMessage}
        isOwn={false}
        senderName="Sarah Chen"
        senderAvatarUrl="https://example.com/avatar.jpg"
        showSenderHeader={true}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Hello from the other side!")).toBeInTheDocument();
  });

  it("renders own message with status indicator and edited label when edited", () => {
    const ownMessage: Message = {
      ...baseMessage,
      senderId: CURRENT_USER_ID,
      status: "read",
      editedAt: new Date().toISOString(),
    };

    render(
      <MessageBubble
        message={ownMessage}
        isOwn={true}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(screen.getByText("edited")).toBeInTheDocument();
    expect(screen.getByLabelText("Read")).toBeInTheDocument();
  });

  it("renders deleted state when message is deleted", () => {
    const deletedMessage: Message = {
      ...baseMessage,
      text: "Old text",
      deletedAt: new Date().toISOString(),
    };

    render(
      <MessageBubble
        message={deletedMessage}
        isOwn={false}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleReaction={vi.fn()}
      />,
    );

    expect(screen.getByText("This message was deleted")).toBeInTheDocument();
    expect(screen.queryByText("Old text")).not.toBeInTheDocument();
  });

  it("renders reactions with counts and handles clicks", async () => {
    const user = userEvent.setup();
    const onToggleReaction = vi.fn();

    const reactedMessage: Message = {
      ...baseMessage,
      reactions: [
        { emoji: "👍", userIds: ["user-2", CURRENT_USER_ID] },
        { emoji: "❤️", userIds: ["user-3"] },
      ],
    };

    render(
      <MessageBubble
        message={reactedMessage}
        isOwn={false}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleReaction={onToggleReaction}
      />,
    );

    const thumbsUp = screen.getByRole("button", { name: "👍 2" });
    expect(thumbsUp).toBeInTheDocument();
    expect(thumbsUp).toHaveClass("text-primary");

    const heart = screen.getByRole("button", { name: "❤️ 1" });
    expect(heart).toBeInTheDocument();

    await user.click(thumbsUp);
    expect(onToggleReaction).toHaveBeenCalledWith("👍");
  });
});
