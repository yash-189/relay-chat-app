import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChatStore } from "@/store/chat.store";
import { renderWithProviders } from "@/test/render";
import { CURRENT_USER_ID } from "../api";
import type { Message } from "../types";
import { MessageComposer } from "./MessageComposer";

const mockSendMessage = vi.fn();
const mockEditMessage = vi.fn();

vi.mock("../hooks/useSendMessage", () => ({
  useSendMessage: () => ({
    mutate: mockSendMessage,
  }),
}));

vi.mock("../hooks/useEditMessage", () => ({
  useEditMessage: () => ({
    mutate: mockEditMessage,
  }),
}));

describe("MessageComposer", () => {
  beforeEach(() => {
    useChatStore.setState({
      drafts: {},
      replyTo: {},
      editingId: {},
      isSearchOpen: false,
    });
    mockSendMessage.mockClear();
    mockEditMessage.mockClear();
  });

  const messages: Message[] = [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-2",
      text: "First message",
      createdAt: new Date().toISOString(),
      status: "delivered",
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: CURRENT_USER_ID,
      text: "My previous message",
      createdAt: new Date().toISOString(),
      status: "sent",
    },
  ];

  it("submits message on Enter and clears textarea", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MessageComposer conversationId="conv-1" messages={messages} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Message text" });
    await user.type(textarea, "Hello world!{enter}");

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: "conv-1",
          text: "Hello world!",
        }),
      );
    });
  });

  it("inserts a newline on Shift+Enter without sending", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MessageComposer conversationId="conv-1" messages={messages} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Message text" });
    await user.type(textarea, "Line 1{shift>}{enter}{/shift}Line 2");

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("Line 1\nLine 2");
  });

  it("disables send button when text is empty or only whitespace", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MessageComposer conversationId="conv-1" messages={messages} />,
    );

    const sendButton = screen.getByRole("button", { name: "Send message" });
    expect(sendButton).toBeDisabled();

    const textarea = screen.getByRole("textbox", { name: "Message text" });
    await user.type(textarea, "   ");
    expect(sendButton).toBeDisabled();
  });

  it("edits the last own message on ArrowUp in empty composer", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MessageComposer conversationId="conv-1" messages={messages} />,
    );

    const textarea = screen.getByRole("textbox", { name: "Message text" });
    await user.type(textarea, "{arrowup}");

    expect(useChatStore.getState().editingId["conv-1"]).toBe("msg-2");
  });

  it("cancels reply on Escape", async () => {
    const user = userEvent.setup();
    useChatStore.getState().setReplyToId("conv-1", "msg-1");

    renderWithProviders(
      <MessageComposer
        conversationId="conv-1"
        messages={messages}
        replyMessage={messages[0]}
        replySenderName="Sarah"
      />,
    );

    expect(screen.getByText(/Replying to Sarah/i)).toBeInTheDocument();

    const textarea = screen.getByRole("textbox", { name: "Message text" });
    await user.type(textarea, "{escape}");

    expect(useChatStore.getState().replyTo["conv-1"]).toBeNull();
  });
});
