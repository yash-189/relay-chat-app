"use client";

import type { RefObject } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { isNearBottom } from "../utils";

interface UseAutoScrollOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  newestKey: string | undefined;
  contentHeight: number;
  onScrollToBottom?: () => void;
}

export function useAutoScroll({
  containerRef,
  newestKey,
  contentHeight,
  onScrollToBottom,
}: UseAutoScrollOptions) {
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const wasNearBottomRef = useRef(true);
  const prevNewestKeyRef = useRef<string | undefined>(undefined);

  const checkNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return isNearBottom(el.scrollTop, el.scrollHeight, el.clientHeight);
  }, [containerRef]);

  const handleScroll = useCallback(() => {
    const near = checkNearBottom();
    wasNearBottomRef.current = near;
    if (near) {
      setHasNewMessagesBelow(false);
    }
  }, [checkNearBottom]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      setHasNewMessagesBelow(false);
      wasNearBottomRef.current = true;

      if (onScrollToBottom) {
        onScrollToBottom();
        return;
      }

      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    [containerRef, onScrollToBottom],
  );

  // rows start at estimated heights and grow once measured; stay pinned to the
  // bottom while that happens, otherwise opening a chat lands above the end
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || contentHeight === 0 || !wasNearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [containerRef, contentHeight]);

  // keyed on the newest message, not the count, so loading older pages
  // above doesn't look like a new message arriving
  useEffect(() => {
    if (!newestKey || newestKey === prevNewestKeyRef.current) return;
    const isFirstLoad = prevNewestKeyRef.current === undefined;
    prevNewestKeyRef.current = newestKey;

    if (isFirstLoad) {
      scrollToBottom("auto");
      return;
    }
    if (wasNearBottomRef.current) {
      scrollToBottom("smooth");
      return;
    }
    setHasNewMessagesBelow(true);
  }, [newestKey, scrollToBottom]);

  return {
    hasNewMessagesBelow,
    handleScroll,
    scrollToBottom,
  };
}
