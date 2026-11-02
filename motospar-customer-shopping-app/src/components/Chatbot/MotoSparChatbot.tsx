import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Loader2,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { sendN8nChatMessage } from '../../services/motosparApi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

/**
 * Authenticated customer support chat assistant connected to the configured
 * N8N_CHAT_WEBHOOK_URL ({ action: "sendMessage", chatInput, sessionId, source: "motospar-customer-mobile-app" }).
 * Never returns hardcoded chatbot answers when unconfigured or offline.
 */
export const MotoSparChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Per-session conversation ID maintained in memory as specified in ARCHITECTURE.md
  const sessionId = useMemo(
    () => `motospar-session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setServiceError(null);

    try {
      const response = await sendN8nChatMessage({
        chatInput: trimmed,
        sessionId,
      });

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: response.reply || 'Empty response received from support service.',
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } else {
        setServiceError(
          response.error ||
            'Support chat service is currently unavailable. Please use Contact Us in your Profile.'
        );
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating launcher above bottom navigation */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open MotoSpar Support Chat"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 min-h-[48px] min-w-[48px] px-4 py-3 rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-transform active:scale-95 flex items-center gap-2"
        >
          <MessageSquare className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-semibold hidden sm:inline whitespace-nowrap">
            Support Chat
          </span>
        </button>
      )}

      {/* Chat modal / sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-xs">
          <div className="w-full sm:w-[390px] h-[78vh] sm:h-[540px] bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <div>
                <h3 className="text-sm font-semibold">MotoSpar Support</h3>
                <p className="text-xs text-slate-300">
                  Live n8n Support Assistant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Support Chat"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {messages.length === 0 && !serviceError && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
                  Send a message to connect with the MotoSpar support webhook.
                  Responses come directly from the configured n8n assistant.
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-slate-500 px-2">
                  <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                  <span>Waiting for support webhook...</span>
                </div>
              )}

              {serviceError && (
                <div
                  role="alert"
                  className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">
                      Chat Assistant Unavailable
                    </p>
                    <p className="text-amber-800">{serviceError}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about parts, fitment, or orders..."
                className="flex-1 min-h-[44px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label="Send chat message"
                className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-rose-600 text-white font-medium text-sm flex items-center justify-center disabled:opacity-50 hover:bg-rose-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
