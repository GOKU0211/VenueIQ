// src/components/AIChatButton.jsx
/**
 * @component AIChatButton
 * @description Floating action button (bottom-right) that toggles the AI chat drawer.
 * The drawer itself is a placeholder — the actual AI integration is marked with
 * a comment for Prompt 2.
 * Includes a welcome message, quick suggestion chips, and a message input stub.
 *
 * @param {{ chatData: import('../mockData').MockData['chat'] }} props
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'

const drawerVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:   { opacity: 0, y: 30, scale: 0.96, transition: { duration: 0.22 } },
}

export default function AIChatButton({ chatData }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  return (
    <>
      {/* ── Overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="chat-overlay fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Chat drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-drawer"
            id="ai-chat-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              fixed bottom-24 right-4 sm:right-6 z-50
              w-[calc(100vw-2rem)] max-w-sm
              glass rounded-2xl border border-[#4F35D230]
              flex flex-col overflow-hidden
            "
            style={{ boxShadow: '0 24px 64px rgba(10,15,44,0.8), 0 0 32px #4F35D230' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#4F35D215] border-b border-[#4F35D220]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F35D2] to-[#1DBFA8] flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-sora text-sm font-semibold text-[#F0EEFF]">{chatData.assistantName}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1DBFA8] animate-pulse" />
                    <span className="font-dm text-[10px] text-[#1DBFA8]">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                id="chat-close-btn"
                className="w-7 h-7 rounded-full bg-[#F0EEFF10] hover:bg-[#F0EEFF20] flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X size={14} className="text-[#F0EEFF80]" />
              </button>
            </div>

            {/* Chat body */}
            <div className="flex-1 px-4 py-4 space-y-3 max-h-72 overflow-y-auto">
              {/* AI_CHAT_DRAWER: plug in Prompt 2 here */}

              {/* Welcome bubble */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4F35D2] to-[#1DBFA8] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="bg-[#4F35D215] border border-[#4F35D225] rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]">
                  <p className="font-dm text-sm text-[#F0EEFF90] leading-relaxed">
                    {chatData.welcomeMessage}
                  </p>
                </div>
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 ml-8">
                {chatData.suggestions.map((s, i) => (
                  <button
                    key={i}
                    id={`chat-suggestion-${i}`}
                    onClick={() => setInput(s)}
                    className="font-dm text-xs px-3 py-1.5 rounded-full bg-[#4F35D220] border border-[#4F35D235] text-[#C8BDFF] hover:bg-[#4F35D235] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input row */}
            <div className="px-3 py-3 border-t border-[#4F35D220] flex gap-2">
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about the venue…"
                className="
                  flex-1 bg-[#4F35D212] border border-[#4F35D230]
                  rounded-xl px-3 py-2.5 font-dm text-sm text-[#F0EEFF90]
                  placeholder-[#F0EEFF35] outline-none
                  focus:border-[#4F35D2] focus:bg-[#4F35D220] transition-colors
                "
              />
              <button
                id="chat-send-btn"
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-[#4F35D2] hover:bg-[#6348E8] flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB ── */}
      <motion.button
        id="ai-chat-fab"
        aria-label="Open AI Chat"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        animate={open ? { rotate: 90 } : { rotate: 0 }}
        transition={{ duration: 0.2 }}
        className="
          fixed bottom-6 right-4 sm:right-6 z-50
          w-14 h-14 rounded-full
          bg-gradient-to-br from-[#4F35D2] to-[#6348E8]
          flex items-center justify-center
          shadow-lg cursor-pointer
        "
        style={{ boxShadow: '0 8px 32px #4F35D260, 0 0 0 3px #4F35D230' }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x"  initial={{ opacity:0, rotate:-90 }} animate={{ opacity:1, rotate:0 }} exit={{ opacity:0 }}>
                <X size={22} className="text-white" />
              </motion.span>
            : <motion.span key="mc" initial={{ opacity:0, rotate: 90 }} animate={{ opacity:1, rotate:0 }} exit={{ opacity:0 }}>
                <MessageCircle size={22} className="text-white" />
              </motion.span>
          }
        </AnimatePresence>
      </motion.button>
    </>
  )
}
