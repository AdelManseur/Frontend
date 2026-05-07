"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { sendAIMessage, getAIChatHistory } from "../../browse/req-res";
import { getMe } from "../../req-res";
import type { AIMessage } from "../../browse/interfaces";
import styles from "./GlobalAIChat.module.css";
import { BotMessageSquare, X, Send } from "lucide-react";
import { useRouter } from "next/navigation";

const formatAIText = (text: string) => {
  return text.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
};

const parseTagsFromAIResponse = (text: string): string[] | null => {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.tags)) {
        return parsed.tags.map(String).filter(Boolean);
      }
      return Object.keys(parsed).filter(Boolean);
    }
    return null;
  } catch {
    return null;
  }
};

export default function GlobalAIChat() {
  const router = useRouter();
  const [myUserId, setMyUserId] = useState<string>("");
  const [aiPartner, setAiPartner] = useState<string>("ai-bot");

  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiDraft, setAiDraft] = useState("");
  const [aiSending, setAiSending] = useState(false);
  const [aiError, setAiError] = useState("");
  const aiMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        if (me?.logged) {
          setMyUserId(me.user._id);
        }
      } catch (err) {
        console.error("Failed to fetch user for AI Chat", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isAIChatOpen || !myUserId || !aiPartner) return;

    (async () => {
      try {
        const history = await getAIChatHistory(myUserId, aiPartner);
        setAiMessages(history);
        setAiError("");
      } catch (err) {
        setAiError(err instanceof Error ? err.message : "Failed to load chat history");
      }
    })();
  }, [isAIChatOpen, myUserId, aiPartner]);

  useEffect(() => {
    if (!aiMessagesRef.current) return;
    aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
  }, [aiMessages]);

  const onSendAIMessage = async (e: FormEvent) => {
    e.preventDefault();
    const content = aiDraft.trim();
    if (!content || aiSending) return;

    if (!myUserId) {
      setAiError("Please log in to use the AI Assistant.");
      return;
    }

    try {
      setAiSending(true);
      setAiError("");

      const responses = await sendAIMessage({
        from: myUserId,
        to: aiPartner,
        content,
      });

      setAiMessages((prev) => [...prev, ...responses]);
      setAiDraft("");

      const assistantReply = responses.find((m) => m.role === "assistant")?.content;
      const tags = assistantReply ? parseTagsFromAIResponse(assistantReply) : null;
      if (tags?.length) {
        // Redirect to browse with tags if AI suggests them
        const query = tags.join(" ");
        router.push(`/browse?q=${encodeURIComponent(query)}`);
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setAiSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsAIChatOpen((v) => !v)}
        className={`${styles.fab} !bg-neutral-900 hover:!bg-neutral-800 !shadow-lg shadow-neutral-900/20`}
        title={isAIChatOpen ? "Close AI chat" : "Open AI chat"}
      >
        {isAIChatOpen ? <X className="w-6 h-6" /> : <BotMessageSquare className="w-6 h-6" />}
      </button>

      {isAIChatOpen && (
        <div className={`${styles.panel} !border-neutral-200 !shadow-2xl`}>
          <div className={`${styles.header} !border-neutral-100`}>
            <div className="flex items-center gap-2">
              <BotMessageSquare className="w-5 h-5 text-neutral-900" />
              <h3 className={`${styles.title} !text-neutral-900`}>AI Assistant</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAIChatOpen(false)}
              className={`${styles.closeBtn} hover:!text-neutral-900`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={aiMessagesRef} className={styles.messages}>
            {aiMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-3">
                <BotMessageSquare className="w-8 h-8 opacity-50" />
                <p className={`${styles.empty} !text-neutral-500`}>Ask me anything to find the perfect service.</p>
              </div>
            ) : (
              aiMessages.map((msg) => {
                const isUser = msg.role === "user";
                const isAssistant = msg.role === "assistant";

                return (
                  <div
                    key={msg._id}
                    className={`${styles.row} ${
                      isUser ? styles.rowUser : styles.rowAssistant
                    }`}
                  >
                    <div
                      className={`${styles.bubble} ${
                        isUser 
                          ? "!bg-neutral-900 !text-white" 
                          : "!bg-neutral-100 !text-neutral-900"
                      }`}
                    >
                      <p
                        dangerouslySetInnerHTML={{
                          __html: formatAIText(msg.content),
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {aiError && <p className={`${styles.error} !text-red-500`}>{aiError}</p>}

          <form onSubmit={onSendAIMessage} className={`${styles.composer} !border-neutral-100`}>
            <input
              value={aiDraft}
              onChange={(e) => setAiDraft(e.target.value)}
              placeholder="Ask me anything..."
              className={`${styles.input} !bg-neutral-50 !border-neutral-200 focus:!border-neutral-900 !text-neutral-900`}
              disabled={aiSending}
            />
            <button
              type="submit"
              disabled={aiSending || !aiDraft.trim()}
              className={`${styles.sendBtn} !bg-neutral-900 hover:!bg-neutral-800 flex items-center justify-center min-w-[40px]`}
              title="Send"
            >
              {aiSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
