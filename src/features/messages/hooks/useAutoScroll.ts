"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isNearBottom } from "../utils";

interface UseAutoScrollOptions {
  totalItems: number;
  onScrollToBottom?: () => void;
}

export function useAutoScroll({
  totalItems,
  onScrollToBottom,
}: UseAutoScrollOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const wasNearBottomRef = useRef(true);
  const prevCountRef = useRef(totalItems);
  const isInitialMountRef = useRef(true);

  const checkNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return isNearBottom(el.scrollTop, el.scrollHeight, el.clientHeight);
  }, []);

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
    [onScrollToBottom],
  );

  useEffect(() => {
    if (totalItems === 0) return;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevCountRef.current = totalItems;
      scrollToBottom("auto");
      return;
    }

    const added = totalItems > prevCountRef.current;
    prevCountRef.current = totalItems;

    if (!added) return;

    if (wasNearBottomRef.current) {
      scrollToBottom("smooth");
    } else {
      setHasNewMessagesBelow(true);
    }
  }, [totalItems, scrollToBottom]);

  return {
    containerRef,
    hasNewMessagesBelow,
    handleScroll,
    scrollToBottom,
  };
}
