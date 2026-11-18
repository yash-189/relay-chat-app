import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { messageKeys } from "./queries";
import type { Message, MessagePage } from "./types";

type MessagePages = InfiniteData<MessagePage, string | null>;

// pages[0] is the newest page and each page is oldest-first
export function flattenPages(data: MessagePages | undefined): Message[] {
  if (!data) return [];
  return data.pages.toReversed().flatMap((page) => page.messages);
}

// lets every writer work on a flat list; older pages keep their size and any
// new messages land on the newest page
function writeBack(data: MessagePages, next: Message[]): MessagePages {
  let offset = 0;
  const olderFirst = data.pages.toReversed().map((page, index, all) => {
    const isNewest = index === all.length - 1;
    const size = isNewest ? next.length - offset : page.messages.length;
    const messages = next.slice(offset, offset + size);
    offset += size;
    return { ...page, messages };
  });
  return { ...data, pages: olderFirst.toReversed() };
}

export function updateCachedMessages(
  queryClient: QueryClient,
  conversationId: string,
  update: (messages: Message[]) => Message[],
): void {
  queryClient.setQueryData<MessagePages>(
    messageKeys.list(conversationId),
    (data) => {
      if (!data) {
        return {
          pages: [{ messages: update([]), nextCursor: null }],
          pageParams: [null],
        };
      }
      return writeBack(data, update(flattenPages(data)));
    },
  );
}

export function getCachedMessages(
  queryClient: QueryClient,
  conversationId: string,
): Message[] {
  return flattenPages(
    queryClient.getQueryData<MessagePages>(messageKeys.list(conversationId)),
  );
}
