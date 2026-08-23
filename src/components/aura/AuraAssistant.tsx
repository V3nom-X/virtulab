import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { X, Send, Sparkles, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aura-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

/** AI/TTS endpoints require a signed-in user session, not the publishable key. */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function stripMarkdown(text: string): string {
  return text.replace(/[#*_`~>\[\]()]/g, '').slice(0, 2000).trim();
}


function useDraggable(initialPos: { x: number; y: number }) {
  const [pos, setPos] = useState(initialPos);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - offset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - offset.current.y));
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return { pos, onPointerDown, onPointerMove, onPointerUp, isDragging: dragging };
}

const MessageBubble = memo(function MessageBubble({
  message,
  index,
  speakingIdx,
  onPlay,
  onStop,
}: {
  message: Message;
  index: number;
  speakingIdx: number | null;
  onPlay: (text: string, idx: number) => void;
  onStop: () => void;
}) {
  return (
    <div className={cn("flex", message.role === 'user' ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
        message.role === 'user'
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-muted rounded-bl-md'
      )}>
        {message.role === 'assistant' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            <button
              onClick={() => speakingIdx === index ? onStop() : onPlay(message.content, index)}
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors",
                speakingIdx === index && "text-primary"
              )}
            >
              <Volume2 className={cn("w-3 h-3", speakingIdx === index && "animate-pulse")} />
              {speakingIdx === index ? 'Playing...' : 'Listen'}
            </button>
          </div>
        ) : message.content}
      </div>
    </div>
  );
});

export function AuraAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const drag = useDraggable({
    x: typeof window !== 'undefined' ? window.innerWidth - 76 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight - 76 : 0,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const stopAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    } catch { /* ignore */ }
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch { /* ignore */ }
    setSpeakingIdx(null);
  }, []);

  const playNativeTTS = useCallback((text: string, idx: number) => {
    try {
      if (!('speechSynthesis' in window)) {
        setSpeakingIdx(null);
        return;
      }
      window.speechSynthesis.cancel();
      const stripped = stripMarkdown(text);
      if (!stripped) { setSpeakingIdx(null); return; }

      const utterance = new SpeechSynthesisUtterance(stripped);
      utterance.rate = 1;
      utterance.pitch = 1.1;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Google UK English Female') ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      );
      if (preferred) utterance.voice = preferred;

      setSpeakingIdx(idx);
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingIdx(null);
    }
  }, []);

  const playTTS = useCallback(async (text: string, idx: number) => {
    stopAudio();
    setSpeakingIdx(idx);
    try {
      const token = await getAccessToken();
      if (!token) {
        playNativeTTS(text, idx);
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: stripMarkdown(text) }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        playNativeTTS(text, idx);
        return;
      }
      const blob = await resp.blob();
      if (blob.size < 100) {
        playNativeTTS(text, idx);
        return;
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeakingIdx(null); URL.revokeObjectURL(url); };
      audio.onerror = () => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
        playNativeTTS(text, idx);
      };
      await audio.play();
    } catch {
      playNativeTTS(text, idx);
    }
  }, [stopAudio, playNativeTTS]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    let assistantSoFar = '';

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      const token = await getAccessToken();
      if (!token) {
        upsert('Please sign in to chat with AURA. 🔬');
        setIsLoading(false);
        return;
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Connection failed' }));
        upsert(err.error || 'Sorry, I encountered an error. Please try again.');
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) { setIsLoading(false); return; }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nlIdx: number;
        while ((nlIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nlIdx);
          buffer = buffer.slice(nlIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ') || line.startsWith(':') || !line.trim()) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { break; }
        }
      }
    } catch {
      upsert("I'm having trouble connecting. Please check your internet connection and try again.");
    }
    setIsLoading(false);

    if (voiceEnabled && assistantSoFar) {
      setMessages(prev => {
        const lastIdx = prev.length - 1;
        if (lastIdx >= 0) playTTS(assistantSoFar, lastIdx);
        return prev;
      });
    }
  }, [voiceEnabled, playTTS]);

  const handleSend = async () => {
    const text = input.trim().slice(0, 2000); // Limit input length
    if (!text || isLoading) return;
    if (text.length < 1) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    // Keep only last 20 messages to prevent payload bloat
    const trimmedHistory = messages.slice(-19);
    const newMessages = [...trimmedHistory, userMsg];
    setMessages(prev => [...prev, userMsg]);
    await streamChat(newMessages);
  };

  // Calculate chat position relative to blob
  const chatStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(drag.pos.x - 300, window.innerWidth - 370),
    top: Math.max(10, drag.pos.y - 530),
    zIndex: 50,
  };

  // Clamp chat position
  if (chatStyle.left && (chatStyle.left as number) < 10) chatStyle.left = 10;

  return (
    <>
      {/* Draggable floating blob button */}
      <button
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onClick={() => { if (!drag.isDragging.current) setIsOpen(!isOpen); }}
        className={cn(
          "fixed z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110 touch-none select-none cursor-grab active:cursor-grabbing",
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
          isOpen && "scale-0 opacity-0"
        )}
        style={{ left: drag.pos.x, top: drag.pos.y }}
        aria-label="Open AURA AI Assistant"
      >
        <Sparkles className="w-6 h-6 pointer-events-none" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      </button>

      {/* Chat popup */}
      <div
        className={cn(
          "w-[360px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-card border rounded-2xl shadow-2xl flex flex-col transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
        style={chatStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AURA</h3>
              <p className="text-[10px] text-muted-foreground">AI Science Tutor</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", voiceEnabled && "text-primary")}
              onClick={() => { setVoiceEnabled(!voiceEnabled); if (voiceEnabled) stopAudio(); }}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setIsOpen(false); stopAudio(); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 px-4">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium mb-1">Hi! I'm AURA 🔬</p>
              <p className="text-xs text-muted-foreground">Your AI science tutor. Ask me anything about physics, chemistry, biology, or earth science!</p>
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                {['Explain osmosis', 'How do pendulums work?', 'What is pH?'].map(q => (
                  <button key={q} onClick={() => setInput(q)} className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              index={i}
              speakingIdx={speakingIdx}
              onPlay={playTTS}
              onStop={stopAudio}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            placeholder="Ask AURA anything..."
            maxLength={2000}
            className="flex-1 bg-muted rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="rounded-full h-9 w-9" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
