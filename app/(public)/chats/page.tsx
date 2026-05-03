"use client";

export default function SellerChatsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="text-5xl">💬</span>
      <h3 className="text-lg font-semibold text-white">Your Messages</h3>
      <p className="text-sm text-gray-500">Select a conversation from the left to start chatting.</p>
    </div>
  );
}