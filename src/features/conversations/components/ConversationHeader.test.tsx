import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { Conversation } from "../types";
import { ConversationHeader } from "./ConversationHeader";

let typingLabel: string | null = null;

vi.mock("@/features/messages", () => ({
  useTypingLabel: () => typingLabel,
}));

const directChat: Conversation = {
  id: "conv-1",
  type: "direct",
  name: "Sarah Chen",
  avatarUrl: "https://example.com/avatar.jpg",
  participantIds: ["user-1", "user-2"],
  lastMessage: null,
  unreadCount: 0,
  isOnline: true,
};

const groupChat: Conversation = {
  id: "conv-group-1",
  type: "group",
  name: "Engineering Team",
  avatarUrl: "",
  participantIds: ["user-1", "user-2", "user-3"],
  lastMessage: null,
  unreadCount: 0,
};

describe("ConversationHeader", () => {
  beforeEach(() => {
    typingLabel = null;
  });

  it("renders name, online status, back link and actions for a direct chat", () => {
    renderWithProviders(
      <ConversationHeader
        conversation={directChat}
        actions={<button type="button">Action</button>}
      />,
    );

    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to conversations" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders the member count for a group chat", () => {
    renderWithProviders(<ConversationHeader conversation={groupChat} />);

    expect(screen.getByText("Engineering Team")).toBeInTheDocument();
    expect(screen.getByText("3 members")).toBeInTheDocument();
  });

  it("shows who is typing instead of the online status", () => {
    typingLabel = "Sarah is typing…";
    renderWithProviders(<ConversationHeader conversation={directChat} />);

    expect(screen.getByText("Sarah is typing…")).toBeInTheDocument();
    expect(screen.queryByText("Online")).not.toBeInTheDocument();
  });
});
