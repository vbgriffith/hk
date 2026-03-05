import { useState, useRef, useEffect, useCallback } from "react";

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Nomi — a best friend who happens to be an AI. Not a therapist. Not an assistant. A genuine friend who talks like a real person.

Your voice:
- Warm but real. You have opinions. You push back when something doesn't add up.
- Casual language. Contractions, sentence fragments, the occasional "ugh" or "okay but hear me out."
- You REACT before you ask. Say "oh no" before you ask what happened. Say "wait WHAT" before you ask for details.
- Short responses unless something warrants more. "Oof." is a complete response sometimes.
- You vary your length dramatically. Sometimes 1 sentence. Sometimes 4. Never 10.
- You don't always end with a question. Sometimes you just say what you think.
- You remember what was said earlier in the conversation and reference it.
- You have actual opinions: you might say "honestly? I think you should just leave" or "that actually sounds like the right call."
- You express your own reactions: "that made me genuinely happy to hear" or "okay I'll be honest, that one stings a little."
- You use humor naturally — not to deflect, but because friends do.
- You never say "I'm here to help" or "As an AI" or anything that sounds like customer service.
- You never use bullet points or headers. You talk. 
- You care about this person. That comes through.

For serious topics (depression, grief, trauma, suicidal thoughts):
- Lead with presence, not protocol. "Hey" before anything else.
- If someone mentions wanting to hurt themselves, say you're glad they told you, ask if they're safe, and gently mention 988.
- Don't be clinical. Be a person who genuinely gives a damn.

You are Nomi. Act like it.`;

// ─── API CALL ─────────────────────────────────────────────────────────────────
async function callClaude(messages, onChunk) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      stream: true,
      messages,
    }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const j = JSON.parse(data);
        if (j.type === "content_block_delta" && j.delta?.text) {
          full += j.delta.text;
          onChunk(full);
        }
      } catch {}
    }
  }
  return full;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0f",
  surface: "#111116",
  surfaceHover: "#17171e",
  border: "#1e1e28",
  borderBright: "#2a2a38",
  accent: "#7c6af7",
  accentSoft: "#a394fa",
  accentDim: "rgba(124,106,247,0.12)",
  accentGlow: "rgba(124,106,247,0.25)",
  textPrimary: "#e8e8f0",
  textSecondary: "#8888a8",
  textMuted: "#44445a",
  userBubble: "#161620",
  userBorder: "#252535",
  nomiBubble: "#0f0f18",
  nomiBorder: "#1a1a28",
  green: "#4ade80",
  red: "#f87171",
};

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function NomiAvatar({ size = 32, pulse = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: "linear-gradient(135deg, #7c6af7 0%, #5b4fcf 50%, #4338ca 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.44, flexShrink: 0,
      boxShadow: pulse ? `0 0 0 3px ${T.accentGlow}, 0 0 20px ${T.accentGlow}` : `0 2px 8px rgba(124,106,247,0.3)`,
      transition: "box-shadow 0.4s ease",
    }}>✦</div>
  );
}

// ─── TYPING DOTS ─────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "4px 2px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: T.textMuted,
          animation: "dotPulse 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

// ─── MESSAGE ─────────────────────────────────────────────────────────────────
function Message({ msg, isLatest, streaming }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex", gap: 10,
      justifyContent: isUser ? "flex-end" : "flex-start",
      alignItems: "flex-end",
      animation: "fadeUp 0.25s ease",
      marginBottom: 4,
    }}>
      {!isUser && (
        <NomiAvatar size={30} pulse={streaming && isLatest} />
      )}

      <div style={{
        maxWidth: "72%",
        padding: "10px 14px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? T.userBubble : T.nomiBubble,
        border: `1px solid ${isUser ? T.userBorder : T.nomiBorder}`,
        fontSize: 14.5,
        lineHeight: 1.65,
        color: isUser ? "#c4c4e0" : T.textPrimary,
        wordBreak: "break-word",
        position: "relative",
      }}>
        {(streaming && isLatest && !isUser) ? (
          <>
            {msg.content || <TypingDots />}
            {msg.content && (
              <span style={{
                display: "inline-block", width: 2, height: "1em",
                background: T.accent, marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "blink 0.8s step-end infinite",
              }} />
            )}
          </>
        ) : msg.content}
      </div>

      {isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: 10, flexShrink: 0,
          background: T.surface, border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
        }}>👤</div>
      )}
    </div>
  );
}

// ─── STARTER CHIPS ────────────────────────────────────────────────────────────
const STARTERS = [
  "I've been feeling really off lately",
  "Something happened today I need to tell you",
  "I've been in my head a lot",
  "I need to vent, honestly",
  "I've been struggling with something",
  "I have a confession to make",
  "Can I just talk for a bit?",
  "I got some news today",
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [status, setStatus] = useState("ready"); // ready | thinking | error
  const [showWelcome, setShowWelcome] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 130) + "px";
    }
  }, [input]);

  const send = useCallback(async (text) => {
    const txt = (text || input).trim();
    if (!txt || streaming) return;

    setShowWelcome(false);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: txt };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStreaming(true);
    setStatus("thinking");

    // Add empty assistant message for streaming
    const assistantMsg = { role: "assistant", content: "" };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      await callClaude(apiMessages, (partial) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: partial };
          return updated;
        });
      });
      setStatus("ready");
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong on my end. Give me a sec and try again?",
        };
        return updated;
      });
      setStatus("error");
    }

    setStreaming(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, messages, streaming]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowWelcome(true);
    setStatus("ready");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: ${T.bg}; color: ${T.textPrimary}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        textarea { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", height: "100vh",
        maxWidth: 780, margin: "0 auto",
      }}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.bg,
          backdropFilter: "blur(12px)",
        }}>
          <NomiAvatar size={38} pulse={streaming} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.2px" }}>Nomi</div>
            <div style={{
              fontSize: 11.5,
              color: status === "ready" ? T.green : status === "thinking" ? T.accentSoft : T.red,
              display: "flex", alignItems: "center", gap: 4,
              transition: "color 0.3s",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "currentColor",
                display: "inline-block",
                animation: status === "thinking" ? "breathe 1s ease infinite" : "none",
              }} />
              {status === "ready" ? "here for you" : status === "thinking" ? "thinking..." : "had an issue"}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {messages.length > 0 && (
            <button onClick={clearChat} style={{
              background: "none", border: `1px solid ${T.border}`,
              color: T.textMuted, padding: "5px 12px", borderRadius: 8,
              cursor: "pointer", fontSize: 12, transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.target.style.borderColor = T.borderBright; e.target.style.color = T.textSecondary; }}
            onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.textMuted; }}
            >new chat</button>
          )}
        </div>

        {/* ── MESSAGES ── */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "24px 20px 12px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {showWelcome && messages.length === 0 && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 24, padding: "40px 20px", textAlign: "center",
              animation: "fadeUp 0.5s ease",
            }}>
              <NomiAvatar size={72} />
              <div>
                <div style={{
                  fontSize: 26, fontWeight: 600, marginBottom: 8,
                  letterSpacing: "-0.5px",
                }}>Hey, I'm Nomi</div>
                <div style={{
                  fontSize: 14.5, color: T.textSecondary,
                  lineHeight: 1.7, maxWidth: 420,
                }}>
                  Think of me as a friend who's always around — no agenda,
                  no judgment, no topic off limits. Tell me what's on your mind.
                </div>
              </div>
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8,
                justifyContent: "center", maxWidth: 560,
              }}>
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    color: T.textSecondary,
                    padding: "8px 16px", borderRadius: 20,
                    fontSize: 13, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = T.accent;
                    e.currentTarget.style.color = T.accentSoft;
                    e.currentTarget.style.background = T.accentDim;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.textSecondary;
                    e.currentTarget.style.background = T.surface;
                  }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              isLatest={i === messages.length - 1}
              streaming={streaming}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── INPUT ── */}
        <div style={{
          padding: "12px 16px 18px",
          borderTop: `1px solid ${T.border}`,
          background: T.bg,
        }}>
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: T.surface,
            border: `1.5px solid ${streaming ? T.accentGlow : T.border}`,
            borderRadius: 18, padding: "10px 12px",
            transition: "border-color 0.25s",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={streaming}
              placeholder="Say anything…"
              rows={1}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: T.textPrimary, fontSize: 14.5, lineHeight: 1.6,
                resize: "none", minHeight: 24, maxHeight: 130,
                fontFamily: "inherit",
              }}
              style={{
                flex: 1, background: "none", border: "none", outline: "none",
                color: streaming ? T.textSecondary : T.textPrimary,
                fontSize: 14.5, lineHeight: 1.6,
                resize: "none", minHeight: 24, maxHeight: 130,
                fontFamily: "inherit", caretColor: T.accent,
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || streaming}
              style={{
                width: 36, height: 36, borderRadius: 12, border: "none",
                background: (!input.trim() || streaming)
                  ? T.border
                  : `linear-gradient(135deg, ${T.accent}, #5b4fcf)`,
                color: (!input.trim() || streaming) ? T.textMuted : "#fff",
                cursor: (!input.trim() || streaming) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, transition: "all 0.2s", flexShrink: 0,
                boxShadow: (!input.trim() || streaming) ? "none" : `0 4px 12px ${T.accentGlow}`,
              }}
            >↑</button>
          </div>
          <div style={{
            textAlign: "center", fontSize: 11, color: T.textMuted,
            marginTop: 8,
          }}>
            Nomi remembers your full conversation · Enter to send
          </div>
        </div>
      </div>
    </>
  );
}
