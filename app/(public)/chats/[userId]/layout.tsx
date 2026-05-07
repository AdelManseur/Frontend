// This layout is intentionally a passthrough.
// All chat UI is handled by the parent /chats/layout.tsx and the chat page.tsx.
export default function UserChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}