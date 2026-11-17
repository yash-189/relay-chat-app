export default async function ChatPage({ params }: PageProps<"/chats/[id]">) {
  const { id } = await params;

  return <div className="flex min-h-0 flex-1 flex-col" data-chat-id={id} />;
}
