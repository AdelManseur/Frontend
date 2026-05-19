import React, { useState } from "react";
import { Tag } from "../../ui/ProgressBar";
import { ChevronDown, Mail, Sparkles } from "lucide-react";

interface MessagesSectionProps {
  messages?: any[];
}

export default function MessagesSection({ messages = [] }: MessagesSectionProps) {
  const [activeTab, setActiveTab] = useState<"messages" | "briefs">("messages");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // If no messages prop is passed, use empty array
  const displayedMessages = filter === "unread" ? messages.filter(m => !m.read) : messages;

  return (
    <div className="glass-card-dark mb-8 overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--jm-seller-border)" }}>
        <h2 className="text-lg font-bold text-white">Respond to Clients</h2>
      </div>

      <div>
        <div className="p-4 px-6 flex flex-wrap items-center justify-between gap-4" style={{ borderBottom: "1px solid var(--jm-seller-border)" }}>
          <div className="flex p-1 rounded-lg" style={{ background: "rgba(13,13,26,0.5)", border: "1px solid var(--jm-seller-border)" }}>
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[14px] font-bold transition-colors ${activeTab === "messages" ? "bg-[rgba(124,58,237,0.2)] text-white shadow-sm" : "text-[rgba(255,255,255,0.6)]"}`}
            >
              <Mail className="w-4 h-4" /> Messages
            </button>
            <button 
              onClick={() => setActiveTab("briefs")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[14px] font-bold transition-colors ${activeTab === "briefs" ? "bg-[rgba(124,58,237,0.2)] text-white shadow-sm" : "text-[rgba(255,255,255,0.6)]"}`}
            >
              <Sparkles className="w-4 h-4" /> Briefs (0)
            </button>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--jm-seller-border)" }}>
          {displayedMessages.map(msg => (
            <div 
              key={msg._id} 
              className="p-4 px-6 transition-colors cursor-pointer"
              style={{ background: !msg.read ? "rgba(124,58,237,0.08)" : "transparent" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = !msg.read ? "rgba(124,58,237,0.08)" : "transparent")}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[rgba(255,255,255,0.2)]">
                  <img src={msg.sender?.pfp || "https://res.cloudinary.com/dztptq6q1/image/upload/v1756046508/user_rencds.png"} alt="Sender" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-[15px] text-white ${!msg.read ? 'font-bold' : 'font-semibold'}`}>
                      {msg.sender?.name || "Unknown"}
                    </h3>
                    <span className="text-[12px] font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <p className={`text-[14px] ${expandedId === msg._id ? '' : 'line-clamp-1'}`} style={{ color: "rgba(255,255,255,0.7)" }}>
                      "{msg.content}"
                    </p>
                    
                    {expandedId === msg._id && (
                      <div className="mt-4">
                        <button className="primary-btn px-4 py-2 text-[13px] rounded-full text-white font-bold" style={{ background: "var(--jm-violet)" }}>
                          Reply to message
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setExpandedId(expandedId === msg._id ? null : msg._id)}
                  className="p-1 rounded-full transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <ChevronDown className={`w-5 h-5 transform transition-transform ${expandedId === msg._id ? 'rotate-180' : ''}`} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>
            </div>
          ))}

          {displayedMessages.length === 0 && (
            <div className="p-8 text-center text-sm font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
              No messages found.
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 text-center" style={{ borderTop: "1px solid var(--jm-seller-border)", background: "rgba(13,13,26,0.4)" }}>
        <button className="text-[14px] font-bold hover:underline" style={{ color: "var(--jm-violet)" }}>
          See all messages &rarr;
        </button>
      </div>
    </div>
  );
}
