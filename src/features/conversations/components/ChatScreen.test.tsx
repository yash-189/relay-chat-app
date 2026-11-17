import { screen } from "@testing-library/react";
import { Component, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { Conversation } from "../types";
import { ChatScreen } from "./ChatScreen";

const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
let result: { data: Conversation | null | undefined; isPending: boolean };

vi.mock("next/navigation", () => ({ notFound: () => notFound() }));
vi.mock("../hooks/useConversation", () => ({
  useConversation: () => result,
}));
vi.mock("@/features/messages", () => ({
  ChatPanel: ({ isGroup }: { isGroup: boolean }) => (
    <div>{isGroup ? "group panel" : "direct panel"}</div>
  ),
  MessageSearchToggle: () => null,
  useTypingLabel: () => null,
}));

const group: Conversation = {
  id: "conv-2",
  type: "group",
  name: "Frontend Architecture",
  avatarUrl: "",
  participantIds: ["user-me", "user-2", "user-4"],
  lastMessage: null,
  unreadCount: 0,
};

// stands in for the not-found boundary Next renders around the page
class NotFoundBoundary extends Component<
  { children: ReactNode },
  { caught: boolean }
> {
  state = { caught: false };
  static getDerivedStateFromError() {
    return { caught: true };
  }
  render() {
    return this.state.caught ? <p>not found page</p> : this.props.children;
  }
}

describe("ChatScreen", () => {
  beforeEach(() => {
    notFound.mockClear();
  });

  it("calls notFound when the conversation doesn't exist", () => {
    result = { data: null, isPending: false };
    vi.spyOn(console, "error").mockImplementation(() => {});
    renderWithProviders(
      <NotFoundBoundary>
        <ChatScreen conversationId="nope" />
      </NotFoundBoundary>,
    );

    expect(notFound).toHaveBeenCalled();
    expect(screen.getByText("not found page")).toBeInTheDocument();
  });

  it("tells the chat panel when the conversation is a group", () => {
    result = { data: group, isPending: false };
    renderWithProviders(<ChatScreen conversationId="conv-2" />);

    expect(screen.getByText("Frontend Architecture")).toBeInTheDocument();
    expect(screen.getByText("group panel")).toBeInTheDocument();
  });
});
