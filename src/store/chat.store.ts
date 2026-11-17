import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatState {
  drafts: Record<string, string>;
  replyTo: Record<string, string | null>;
  editingId: Record<string, string | null>;
  isSearchOpen: boolean;

  setDraft: (conversationId: string, text: string) => void;
  clearDraft: (conversationId: string) => void;
  setReplyToId: (conversationId: string, replyToId: string | null) => void;
  setEditingId: (conversationId: string, editingId: string | null) => void;
  toggleSearch: () => void;
  setSearchOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      drafts: {},
      replyTo: {},
      editingId: {},
      isSearchOpen: false,

      setDraft: (conversationId, text) =>
        set((state) => ({
          drafts: { ...state.drafts, [conversationId]: text },
        })),

      clearDraft: (conversationId) =>
        set((state) => {
          const { [conversationId]: _, ...rest } = state.drafts;
          return { drafts: rest };
        }),

      setReplyToId: (conversationId, replyToId) =>
        set((state) => ({
          replyTo: { ...state.replyTo, [conversationId]: replyToId },
        })),

      setEditingId: (conversationId, editingId) =>
        set((state) => ({
          editingId: { ...state.editingId, [conversationId]: editingId },
        })),

      toggleSearch: () =>
        set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
    }),
    {
      name: "chat-app-drafts",
      // persist drafts only; reply, editing and search remain in-memory
      partialize: (state) => ({ drafts: state.drafts }),
    },
  ),
);
