import { FileText, X } from "lucide-react";
import type { Attachment } from "../types";
import { formatFileSize, isImageAttachment } from "../utils";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: () => void;
}

export function AttachmentPreview({
  attachment,
  onRemove,
}: AttachmentPreviewProps) {
  return (
    <div className="mb-2 flex items-center gap-3 rounded-md bg-muted px-3 py-2">
      {isImageAttachment(attachment) ? (
        // biome-ignore lint/performance/noImgElement: local data url, next/image can't optimise it
        <img
          src={attachment.url}
          alt={attachment.name}
          className="size-12 rounded object-cover"
        />
      ) : (
        <FileText className="size-8 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{attachment.name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(attachment.size)}
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
        aria-label="Remove attachment"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
