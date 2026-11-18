import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attachment } from "../types";
import { formatFileSize, isImageAttachment } from "../utils";

interface MessageAttachmentProps {
  attachment: Attachment;
  isOwn: boolean;
}

export function MessageAttachment({
  attachment,
  isOwn,
}: MessageAttachmentProps) {
  if (isImageAttachment(attachment)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="mb-1 block"
      >
        {/* biome-ignore lint/performance/noImgElement: local data url, next/image can't optimise it */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="max-h-72 w-full rounded-lg object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      download={attachment.name}
      className={cn(
        "mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2",
        isOwn ? "bg-primary-foreground/15" : "bg-background/60",
      )}
    >
      <FileText className="size-7 shrink-0" />
      <span className="min-w-0">
        <span className="block truncate font-medium text-sm">
          {attachment.name}
        </span>
        <span className="block text-xs opacity-75">
          {formatFileSize(attachment.size)}
        </span>
      </span>
    </a>
  );
}
