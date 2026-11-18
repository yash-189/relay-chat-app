import type { ReactNode } from "react";
import type { User } from "@/features/users";
import { getInitials } from "@/shared/utils/getInitials";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/ui/primitives/avatar";

interface MemberRowProps {
  user: User;
  isYou?: boolean;
  action?: ReactNode;
}

export function MemberRow({ user, isYou = false, action }: MemberRowProps) {
  return (
    <li className="flex items-center gap-3 py-2">
      <Avatar>
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        {user.isOnline && (
          <AvatarBadge
            className="bg-online ring-background"
            aria-hidden="true"
          />
        )}
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">
          {user.name}
          {isYou && <span className="text-muted-foreground"> (you)</span>}
        </p>
        <p className="text-muted-foreground text-xs">
          {user.isOnline ? "Online" : "Offline"}
        </p>
      </div>
      {action}
    </li>
  );
}
