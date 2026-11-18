"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useChatStore } from "@/store/chat.store";
import { Button } from "@/ui/primitives/button";
import { CURRENT_USER_ID } from "../api";
import { DELETED_MESSAGE_LABEL } from "../constants";
import { useAttachmentPicker } from "../hooks/useAttachmentPicker";
import { useEditMessage } from "../hooks/useEditMessage";
import { useSendMessage } from "../hooks/useSendMessage";
import { type ComposerFormValues, composerSchema } from "../schemas";
import type { Message } from "../types";
import { findLatestOwnMessage } from "../utils";
import { AttachmentPreview } from "./AttachmentPreview";

function hasFinePointer() {
  return window.matchMedia?.("(pointer: fine)").matches ?? false;
}

interface MessageComposerProps {
  conversationId: string;
  conversationName: string;
  messages: Message[];
  replyMessage?: Message | null;
  replySenderName?: string;
  editingMessage?: Message | null;
}

export function MessageComposer({
  conversationId,
  conversationName,
  messages,
  replyMessage,
  replySenderName,
  editingMessage,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const draft = useChatStore((s) => s.drafts[conversationId] ?? "");
  const setDraft = useChatStore((s) => s.setDraft);
  const clearDraft = useChatStore((s) => s.clearDraft);
  const replyToId = useChatStore((s) => s.replyTo[conversationId] ?? null);
  const setReplyToId = useChatStore((s) => s.setReplyToId);
  const editingId = useChatStore((s) => s.editingId[conversationId] ?? null);
  const setEditingId = useChatStore((s) => s.setEditingId);

  const sendMessageMutation = useSendMessage(conversationId);
  const editMessageMutation = useEditMessage(conversationId);
  const {
    inputRef: fileInputRef,
    attachment,
    openPicker,
    handleFileChange,
    clearAttachment,
  } = useAttachmentPicker();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<ComposerFormValues>({
      resolver: zodResolver(composerSchema),
      defaultValues: { text: draft },
    });

  const currentText = watch("text");

  const focusTarget = editingId ?? replyToId ?? conversationId;

  useEffect(() => {
    if (focusTarget && hasFinePointer()) textareaRef.current?.focus();
  }, [focusTarget]);

  // load the saved draft when switching chats
  useEffect(() => {
    if (editingMessage) {
      setValue("text", editingMessage.text);
    } else {
      setValue("text", draft);
    }
  }, [draft, editingMessage, setValue]);

  const handleCancelEditing = () => {
    setEditingId(conversationId, null);
    setValue("text", draft);
  };

  const handleCancelReply = () => {
    setReplyToId(conversationId, null);
  };

  const onSubmit = (data: ComposerFormValues) => {
    const text = data.text.trim();

    if (editingId && editingMessage) {
      if (!text) return;
      editMessageMutation.mutate({ id: editingId, text });
      setEditingId(conversationId, null);
      setValue("text", draft);
    } else {
      if (!text && !attachment) return;
      const id = crypto.randomUUID();
      sendMessageMutation.mutate({
        id,
        conversationId,
        text,
        replyToId: replyToId ?? undefined,
        attachment: attachment ?? undefined,
      });
      clearAttachment();
      clearDraft(conversationId);
      setReplyToId(conversationId, null);
      reset({ text: "" });
    }
  };

  const handleEscape = () => {
    if (editingId) {
      handleCancelEditing();
      return;
    }
    if (replyToId) {
      handleCancelReply();
    }
  };

  const handleArrowUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (editingId || currentText?.trim()) return;
    const lastOwnMessage = findLatestOwnMessage(messages, CURRENT_USER_ID);
    if (!lastOwnMessage) return;
    e.preventDefault();
    setEditingId(conversationId, lastOwnMessage.id);
    setValue("text", lastOwnMessage.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      handleEscape();
      return;
    }

    if (e.key === "ArrowUp") {
      handleArrowUp(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue("text", val);
    if (!editingId) {
      setDraft(conversationId, val);
    }
  };

  const { ref: formRef, ...restRegister } = register("text");

  return (
    <div className="border-t bg-background px-4 py-2">
      <div>
        {editingMessage && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-primary">
                Editing message:
              </span>{" "}
              <span className="truncate text-muted-foreground">
                {editingMessage.text}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelEditing}
              className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Cancel editing"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {replyMessage && !editingMessage && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-primary">
                Replying to {replySenderName ?? "message"}:
              </span>{" "}
              <span className="truncate text-muted-foreground">
                {replyMessage.deletedAt
                  ? DELETED_MESSAGE_LABEL
                  : replyMessage.text}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelReply}
              className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              aria-label="Cancel reply"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {attachment && !editingMessage && (
          <AttachmentPreview
            attachment={attachment}
            onRemove={clearAttachment}
          />
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-end gap-2"
        >
          {!editingId && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                aria-label="Attach a file"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={openPicker}
                aria-label="Attach file"
              >
                <Paperclip className="size-4" />
              </Button>
            </>
          )}
          <textarea
            {...restRegister}
            ref={(node) => {
              formRef(node);
              textareaRef.current = node;
            }}
            rows={1}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            placeholder={`Message ${conversationName}`}
            className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border bg-muted/40 px-3 py-2 text-[0.9375rem] outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-1 focus:ring-ring"
            aria-label="Message text"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!currentText?.trim() && !(attachment && !editingId)}
            aria-label={editingId ? "Save edited message" : "Send message"}
          >
            {editingId ? (
              <Check className="size-4" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
        <p className="mt-1 hidden pl-11 text-muted-foreground text-xs md:block">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
