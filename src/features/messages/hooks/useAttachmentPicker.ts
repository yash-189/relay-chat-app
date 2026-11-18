"use client";

import { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import type { Attachment } from "../types";
import { formatFileSize } from "../utils";

// data urls live in memory, so keep files small
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useAttachmentPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  const openPicker = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("File is too large", {
        description: `Max ${formatFileSize(MAX_ATTACHMENT_BYTES)}`,
      });
      return;
    }

    try {
      const url = await readAsDataUrl(file);
      setAttachment({
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        url,
      });
    } catch {
      toast.error("Couldn't read that file");
    }
  };

  const clearAttachment = () => setAttachment(null);

  return {
    inputRef,
    attachment,
    openPicker,
    handleFileChange,
    clearAttachment,
  };
}
