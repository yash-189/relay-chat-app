"use client";

import { useEffect, useRef, useState } from "react";
import { onTyping } from "../api";

const TYPING_TIMEOUT_MS = 5000;

export function useTypingUsers(conversationId: string) {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    setTypingUserIds([]);
    for (const timer of timersRef.current.values()) {
      clearTimeout(timer);
    }
    timersRef.current.clear();

    const unsubscribe = onTyping((event) => {
      if (event.conversationId !== conversationId) return;

      const { userId, isTyping } = event;
      const currentTimer = timersRef.current.get(userId);
      if (currentTimer) {
        clearTimeout(currentTimer);
        timersRef.current.delete(userId);
      }

      if (isTyping) {
        setTypingUserIds((prev) =>
          prev.includes(userId) ? prev : [...prev, userId],
        );
        const timer = setTimeout(() => {
          setTypingUserIds((prev) => prev.filter((id) => id !== userId));
          timersRef.current.delete(userId);
        }, TYPING_TIMEOUT_MS);
        timersRef.current.set(userId, timer);
      } else {
        setTypingUserIds((prev) => prev.filter((id) => id !== userId));
      }
    });

    const timers = timersRef.current;
    return () => {
      unsubscribe();
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, [conversationId]);

  return typingUserIds;
}
