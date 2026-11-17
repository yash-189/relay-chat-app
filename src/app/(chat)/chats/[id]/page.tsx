import { ChatScreen } from "@/features/conversations";

export default async function ChatPage({ params }: PageProps<"/chats/[id]">) {
  const { id } = await params;
  return <ChatScreen conversationId={id} />;
}
