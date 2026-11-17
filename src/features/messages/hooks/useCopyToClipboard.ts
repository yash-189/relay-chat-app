"use client";

import { useCallback } from "react";
import { toast } from "@/lib/toast";

const COPIED_TOAST = "Copied to clipboard";
const COPY_FAILED_TOAST = "Failed to copy";

export function useCopyToClipboard() {
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(COPIED_TOAST);
    } catch {
      toast.error(COPY_FAILED_TOAST);
    }
  }, []);

  return { copy };
}
