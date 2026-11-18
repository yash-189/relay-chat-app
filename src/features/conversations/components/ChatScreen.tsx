"use client";

import { notFound } from "next/navigation";
import { GroupInfoButton } from "@/features/groups";
import {
  ChatPanel,
  ChatPanelSkeleton,
  MessageSearchToggle,
} from "@/features/messages";
import { useConversation } from "../hooks/useConversation";
import {
  ConversationHeader,
  ConversationHeaderSkeleton,
} from "./ConversationHeader";

interface ChatScreenProps {
  conversationId: string;
}

export function ChatScreen({ conversationId }: ChatScreenProps) {
  const { data: conversation, isPending } = useConversation(conversationId);

  if (isPending) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ConversationHeaderSkeleton />
        <ChatPanelSkeleton />
      </div>
    );
  }
  if (!conversation) notFound();

  const isGroup = conversation.type === "group";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationHeader
        conversation={conversation}
        actions={
          <>
            <MessageSearchToggle />
            {isGroup && <GroupInfoButton group={conversation} />}
          </>
        }
      />
      {/* keyed so search and scroll state reset when switching chats */}
      <ChatPanel
        key={conversation.id}
        conversationId={conversation.id}
        isGroup={isGroup}
      />
    </div>
  );
}
