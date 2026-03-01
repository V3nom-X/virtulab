import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Sparkles, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/expandable-chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aura-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

function stripMarkdown(text: string): string {
  return text.replace(/[#*_`~>\[\]()]/g, '').slice(0, 2000).trim();
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
      if (!('speechSynthesis' in window)) { setSpeakingIdx(null); return; }
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
    } catch { setSpeakingIdx(null); }
  }, []);

  const playTTS = useCallback(async (text: string, idx: number) => {
    stopAudio();
    setSpeakingIdx(idx);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const resp = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: stripMarkdown(text) }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) { playNativeTTS(text, idx); return; }
      const blob = await resp.blob();
      if (blob.size < 100) { playNativeTTS(text, idx); return; }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeakingIdx(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeakingIdx(null); URL.revokeObjectURL(url); playNativeTTS(text, idx); };
      await audio.play();
    } catch { playNativeTTS(text, idx); }
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
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    await streamChat(newMessages);
  };

  return (
    <ExpandableChat
      size="md"
      position="bottom-right"
      isOpen={isOpen}
      onToggle={() => { setIsOpen(!isOpen); if (isOpen) stopAudio(); }}
      icon={<Sparkles className="h-6 w-6" />}
    >
      <ExpandableChatHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
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
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody className="p-3 space-y-3">
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
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AURA anything..."
            className="flex-1 bg-muted rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="rounded-full h-9 w-9" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}
