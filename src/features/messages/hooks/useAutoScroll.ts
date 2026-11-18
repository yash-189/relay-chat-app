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
  totalItems: number;
  contentHeight: number;
  onScrollToBottom?: () => void;
}

export function useAutoScroll({
  containerRef,
  totalItems,
  contentHeight,
  onScrollToBottom,
}: UseAutoScrollOptions) {
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);
  const wasNearBottomRef = useRef(true);
  const prevCountRef = useRef(totalItems);
  const isInitialMountRef = useRef(true);

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
    hasNewMessagesBelow,
    handleScroll,
    scrollToBottom,
  };
}
