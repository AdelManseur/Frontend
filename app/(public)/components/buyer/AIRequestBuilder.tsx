"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Check, Edit2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './AIRequestBuilder.module.css';

import type { AIRequestStep, AIRequestDraft } from '../../interfaces';
import { sendAIRequestStep, ensureConversationExists, sendMessageToSeller } from '../../browse/[gigId]/req-res';

interface AIRequestBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  buyerId: string;
  sellerId: string;
  gigContext: {
    gigId: string;
    gigTitle: string;
    sellerName: string;
    requirements: string[];
  };
}

type StepState = AIRequestStep | "done";

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  draft?: string;
  step?: AIRequestStep;
}

const STEPS: AIRequestStep[] = ["intent", "timeline", "budget", "extras", "compose"];

export default function AIRequestBuilder({
  isOpen,
  onClose,
  buyerId,
  sellerId,
  gigContext,
}: AIRequestBuilderProps) {
  const router = useRouter();
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = STEPS[currentStepIndex];
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [drafts, setDrafts] = useState<Partial<AIRequestDraft>>({});
  const [finalMessage, setFinalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with intent step
      startStep("intent", "Hi! I'm here to help you write a great request. First, what do you need from the seller?");
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startStep = (step: AIRequestStep, aiText: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'ai', text: aiText, step }
    ]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue('');
    
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: userText }
    ]);

    setIsTyping(true);

    try {
      const res = await sendAIRequestStep({
        from: buyerId,
        step: currentStep,
        userInput: userText,
        gigContext,
        previousDrafts: drafts
      });

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: res.aiReply, draft: res.draft, step: currentStep }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: "Sorry, I ran into an error processing that." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApprove = (step: AIRequestStep, draftText: string) => {
    setDrafts(prev => ({ ...prev, [step]: draftText }));
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStepIndex(nextIndex);
      const nextStep = STEPS[nextIndex];
      
      if (nextStep === "compose") {
        // Automatically trigger compose
        triggerCompose({ ...drafts, [step]: draftText });
      }
    }
  };

  const handleSkip = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStepIndex(nextIndex);
      const nextStep = STEPS[nextIndex];
      
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'user', text: "(Skipped)" }
      ]);

      if (nextStep === "compose") {
        triggerCompose(drafts);
      } else {
        // Start next step with generic prompt
        startStep(nextStep, `Moving on to ${nextStep}. What would you like to add?`);
      }
    }
  };

  const triggerCompose = async (currentDrafts: Partial<AIRequestDraft>) => {
    setIsTyping(true);
    try {
      const res = await sendAIRequestStep({
        from: buyerId,
        step: "compose",
        userInput: "",
        gigContext,
        previousDrafts: currentDrafts
      });
      
      setFinalMessage(res.draft);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: res.aiReply, step: "compose" }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const sendFinalToSeller = async () => {
    if (!finalMessage.trim()) return;
    setIsSending(true);
    try {
      const convId = await ensureConversationExists(sellerId, buyerId);
      if (!convId) throw new Error("Failed to create conversation");

      await sendMessageToSeller({
        from: buyerId,
        to: sellerId,
        content: finalMessage
      });

      setIsDone(true);
      setTimeout(() => {
        router.push(`/chats?convId=${convId}`);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div 
          className={styles.panel}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.title}>
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Request Builder
              </div>
              <button onClick={onClose} className={styles.closeButton}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress */}
            <div className={styles.progressBar}>
              {STEPS.map((step, idx) => (
                <div 
                  key={step}
                  className={`${styles.progressDot} ${
                    idx < currentStepIndex ? styles.completed : idx === currentStepIndex ? styles.active : ''
                  }`}
                  title={step}
                />
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.sender]}`}>
                <div className={styles.bubble}>{msg.text}</div>
                
                {msg.draft && msg.step !== "compose" && (
                  <div className={styles.draftBox}>
                    <strong>Draft:</strong> {msg.draft}
                  </div>
                )}

                {msg.draft && msg.sender === 'ai' && msg.step === currentStep && currentStep !== "compose" && (
                  <div className={styles.actionArea}>
                    <button className={styles.approveBtn} onClick={() => handleApprove(msg.step as AIRequestStep, msg.draft!)}>
                      <Check className="w-4 h-4" /> Looks Good
                    </button>
                    <button className={styles.skipBtn} onClick={() => setInputValue('I want to change that to: ')}>
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className={`${styles.message} ${styles.ai}`}>
                <div className={`${styles.bubble} ${styles.typingIndicator}`}>
                  <div className={styles.typingDot} />
                  <div className={styles.typingDot} />
                  <div className={styles.typingDot} />
                </div>
              </div>
            )}
            
            {currentStep === "compose" && finalMessage && !isTyping && !isDone && (
              <div className={styles.reviewPane}>
                <textarea 
                  className={styles.reviewTextarea}
                  value={finalMessage}
                  onChange={(e) => setFinalMessage(e.target.value)}
                />
                <button 
                  className={styles.sendFinalBtn}
                  onClick={sendFinalToSeller}
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : "Send to Seller"} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {isDone && (
              <div className="text-center p-6 text-green-600 font-semibold flex flex-col items-center gap-2">
                <Check className="w-12 h-12 p-2 bg-green-100 rounded-full" />
                Message Sent! Redirecting...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          {currentStep !== "compose" && !isDone && (
            <div className={styles.inputArea}>
              {currentStep === "extras" && (
                <button 
                  onClick={handleSkip}
                  className="mb-3 text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                >
                  Skip this step <ArrowRight className="w-3 h-3" />
                </button>
              )}
              <div className={styles.inputForm}>
                <textarea
                  className={styles.input}
                  placeholder="Type your response..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                />
                <button 
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
