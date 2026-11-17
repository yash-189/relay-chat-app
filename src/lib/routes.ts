export const Routes = {
  home: "/",
  chat: (id: string) => `/chats/${encodeURIComponent(id)}`,
} as const;
