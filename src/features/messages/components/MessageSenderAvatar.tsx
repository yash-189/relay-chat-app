import { Avatar, AvatarFallback, AvatarImage } from "@/ui/primitives/avatar";

interface MessageSenderAvatarProps {
  name?: string;
  avatarUrl?: string | null;
}

export function MessageSenderAvatar({
  name,
  avatarUrl,
}: MessageSenderAvatarProps) {
  const fallback = name ? name.slice(0, 2).toUpperCase() : "?";

  return (
    <Avatar className="size-7 shrink-0 select-none">
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "User"} />}
      <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
    </Avatar>
  );
}
