import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CURRENT_USER_ID } from "../api";
import type { Conversation } from "../types";
import { ConversationItem } from "./ConversationItem";

vi.mock("@/features/messages", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/messages")>()),
  useTypingLabel: () => null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useParams: () => ({}),
}));

describe("ConversationItem", () => {
  const baseConversation: Conversation = {
    id: "conv-1",
    type: "direct",
    name: "Sarah Chen",
    avatarUrl: "https://example.com/avatar.jpg",
    participantIds: [CURRENT_USER_ID, "user-2"],
    lastMessage: {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-2",
      text: "See you at the sync meeting!",
      createdAt: new Date().toISOString(),
      status: "delivered",
    },
    unreadCount: 3,
    isOnline: true,
  };

  it("renders conversation name, preview, relative time, and unread badge", () => {
    render(<ConversationItem conversation={baseConversation} />);

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(
      screen.getByText("See you at the sync meeting!"),
    ).toBeInTheDocument();
    expect(screen.getByText("just now")).toBeInTheDocument();

    const badge = screen.getByLabelText("3 unread messages");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("does not render unread badge when unreadCount is 0", () => {
    const readConversation: Conversation = {
      ...baseConversation,
      unreadCount: 0,
    };

    render(<ConversationItem conversation={readConversation} />);

    expect(screen.queryByLabelText(/unread message/i)).not.toBeInTheDocument();
  });

  it("prefixes 'You: ' on preview for own messages", () => {
    const ownConversation: Conversation = {
      ...baseConversation,
      lastMessage: {
        id: "msg-own",
        conversationId: "conv-1",
        senderId: CURRENT_USER_ID,
        text: "I sent the final files.",
        createdAt: new Date().toISOString(),
        status: "sent",
      },
    };

    render(<ConversationItem conversation={ownConversation} />);

    expect(
      screen.getByText("You: I sent the final files."),
    ).toBeInTheDocument();
  });

  it("renders deleted message copy when last message was deleted", () => {
    const deletedConversation: Conversation = {
      ...baseConversation,
      lastMessage: {
        id: "msg-del",
        conversationId: "conv-1",
        senderId: "user-2",
        text: "",
        createdAt: new Date().toISOString(),
        status: "delivered",
        deletedAt: new Date().toISOString(),
      },
    };

    render(<ConversationItem conversation={deletedConversation} />);

    expect(screen.getByText("This message was deleted")).toBeInTheDocument();
  });

  it("renders group icon for group conversations", () => {
    const groupConversation: Conversation = {
      ...baseConversation,
      id: "conv-group-1",
      type: "group",
      name: "Engineering Team",
      unreadCount: 0,
    };

    render(<ConversationItem conversation={groupConversation} />);

    expect(screen.getByTestId("group-icon")).toBeInTheDocument();
  });

  it("renders online dot for online direct conversations", () => {
    render(<ConversationItem conversation={baseConversation} />);

    expect(screen.getByLabelText("Online")).toBeInTheDocument();
  });

  it("applies active aria-current attribute when isActive is true", () => {
    render(
      <ConversationItem conversation={baseConversation} isActive={true} />,
    );

    const link = screen.getByRole("link", { name: /Sarah Chen/i });
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
