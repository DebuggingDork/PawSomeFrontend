import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { LogOut, User, PawPrint, Send, ArrowLeft, Menu, X } from "lucide-react";
import logoIcon from "@/assets/icon.png";
import { api, WS_BASE_URL } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface ChatMessage {
  id: string;
  sender_pet_id: string;
  content: string;
  msg_type: string;
  created_at: string;
  is_read?: boolean;
}

interface ChatHistory {
  messages: ChatMessage[];
  total: number;
  has_more: boolean;
  unread_count: number;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [myPetIds, setMyPetIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed">("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isTypingRef = useRef(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  // Load history and user's pet IDs on mount
  useEffect(() => {
    if (!matchId) return;

    async function init() {
      try {
        const [pets, history] = await Promise.all([
          api.get<Array<{ id: string }>>("/pets/me"),
          api.get<ChatHistory>(`/chat/${matchId}/history?limit=50`),
        ]);
        setMyPetIds(new Set(pets.map((p) => p.id)));
        setMessages(history.messages);
        setHasMore(history.has_more);

        // Mark all loaded messages as read
        const lastMsg = history.messages[history.messages.length - 1];
        if (lastMsg) {
          api.post(`/chat/${matchId}/read`, { message_id: lastMsg.id }).catch(() => {});
        }
      } catch {
        // show empty chat on error
      } finally {
        setLoadingHistory(false);
      }
    }

    init();
  }, [matchId]);

  // Connect WebSocket
  useEffect(() => {
    if (!matchId) return;

    const token = localStorage.getItem("pawsome_access_token");
    if (!token) {
      navigate("/auth");
      return;
    }

    const ws = new WebSocket(`${WS_BASE_URL}/chat/ws/${matchId}?token=${token}`);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => setWsStatus("open");
    ws.onclose = () => setWsStatus("closed");

    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string);
        if (frame.type === "message") {
          setMessages((prev) => [...prev, frame.data as ChatMessage]);
        } else if (frame.type === "typing") {
          setIsOtherTyping((frame.data as { is_typing: boolean }).is_typing);
          if ((frame.data as { is_typing: boolean }).is_typing) {
            // auto-clear if no update for 4 s
            setTimeout(() => setIsOtherTyping(false), 4000);
          }
        }
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      ws.close();
    };
  }, [matchId, navigate]);

  const sendFrame = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // Send typing: true
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendFrame({ type: "typing", is_typing: true });
    }

    // Reset typing timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendFrame({ type: "typing", is_typing: false });
    }, 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || wsStatus !== "open") return;

    setSending(true);
    sendFrame({ type: "message", content, msg_type: "text" });

    // Stop typing indicator
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    sendFrame({ type: "typing", is_typing: false });

    setInput("");
    setSending(false);
  };

  const loadMore = async () => {
    if (!matchId || messages.length === 0) return;
    const oldest = messages[0];
    try {
      const history = await api.get<ChatHistory>(
        `/chat/${matchId}/history?limit=50&before=${oldest.id}`
      );
      setMessages((prev) => [...history.messages, ...prev]);
      setHasMore(history.has_more);
    } catch {
      // silent
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  if (!matchId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-neutral-400">No match selected. <Link to="/matches" className="text-[#ff6b35]">Go to Matches</Link></p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white overflow-hidden">

      {/* Navbar */}
      <header className="shrink-0 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md z-50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/matches" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={logoIcon} alt="PawSome" className="h-8 w-8 drop-shadow-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#ff6b35] via-[#ff8c5c] to-[#ff6b35] bg-clip-text text-transparent"
                style={{ fontFamily: "Pacifico, cursive" }}>
                PawSome
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection status */}
            <span className={`hidden sm:flex items-center gap-1.5 text-xs ${
              wsStatus === "open" ? "text-emerald-400" :
              wsStatus === "connecting" ? "text-yellow-400" : "text-red-400"
            }`}>
              <span className={`h-2 w-2 rounded-full ${
                wsStatus === "open" ? "bg-emerald-400" :
                wsStatus === "connecting" ? "bg-yellow-400 animate-pulse" : "bg-red-400"
              }`} />
              {wsStatus === "open" ? "Connected" : wsStatus === "connecting" ? "Connecting…" : "Disconnected"}
            </span>

            <nav className="hidden items-center gap-2 md:flex">
              <Link to="/profile" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white">
                <User className="h-4 w-4" />
              </Link>
              <Link to="/my-pets" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white">
                <PawPrint className="h-4 w-4" />
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm font-medium text-white/70 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="h-4 w-4" />
              </button>
            </nav>

            <button className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
              onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-neutral-950/95 px-6 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              <Link to="/profile" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                <User className="h-4 w-4" />Profile
              </Link>
              <Link to="/my-pets" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                <PawPrint className="h-4 w-4" />My Pets
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-red-500/10 hover:text-red-400">
                <LogOut className="h-4 w-4" />Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center">
              <button onClick={loadMore}
                className="rounded-full border border-white/10 px-5 py-1.5 text-xs text-neutral-400 hover:border-white/20 hover:text-white transition-all">
                Load earlier messages
              </button>
            </div>
          )}

          {/* Skeleton */}
          {loadingHistory && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className="h-10 w-48 rounded-2xl bg-white/5 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingHistory && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-neutral-500 text-sm">No messages yet. Say hello! 👋</p>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => {
            const isMine = myPetIds.has(msg.sender_pet_id);
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] text-white rounded-br-sm"
                    : "bg-white/10 text-white rounded-bl-sm"
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`mt-1 text-[10px] ${isMine ? "text-white/60" : "text-neutral-500"}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isOtherTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span key={i}
                      className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-white/10 bg-neutral-950/80 backdrop-blur-md px-4 py-3">
        <form onSubmit={handleSend} className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            placeholder={wsStatus === "open" ? "Type a message…" : "Connecting…"}
            value={input}
            onChange={handleInputChange}
            disabled={wsStatus !== "open"}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff6b35] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || wsStatus !== "open" || sending}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c5c] text-white transition-all hover:from-[#ff5722] hover:to-[#ff6b35] disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {wsStatus === "closed" && (
          <p className="mt-1 text-center text-xs text-red-400">
            Connection lost.{" "}
            <button onClick={() => window.location.reload()} className="underline hover:no-underline">
              Reconnect
            </button>
          </p>
        )}
      </div>

    </div>
  );
}
